import {Command} from "commander";
import {Action, CommandDef, CPMContext, CPMPluginCreator, Workflow} from ".";
import {
    autoSync,
    CommandAction,
    configFilePath, convertFlatToTree, createFile,
    createFolder, createWorkflowCommand,
    defaultProjectsRootPath, FileBasedKeyValueStore, folderPath,
    globalConfigFilePath,
    globalFolderPath, globalPackageJsonFile,
    globalPluginRoot,
    globalSecretsFilePath, globalVariablesFilePath,
    isProjectRepo, packageJsonFile, parseCommand,
    pluginRoot,
    readYaml, runWorkflow,
    secretsFilePath, setAliases, TreeNode, variablesFilePath,
    writeYaml
} from "./util";
import {existsSync} from "fs";
import cpmCommands from './commands';
import plugins from "./plugins";

const loadDynamicPlugin = async (actions: Record<string, CommandAction>, commands: Record<string, CommandDef>,
                                 config: Record<string, any>, variablesFile: string, secretsFile: string,
                                 pluginRoot: string, pluginName: string) => {
    const pluginPath = `${pluginRoot}/${pluginName}`;

    try {
        const pluginCreator = ((await import(pluginPath)).default as CPMPluginCreator);
        await loadPlugin(actions, commands, config, variablesFile, secretsFile, pluginName, pluginCreator);
    } catch (err) {
        console.error(`error loading plugin ${pluginName}`);
        console.error(err);
    }
}

const loadPlugin = async (actions: Record<string, CommandAction>, commands: Record<string, CommandDef>,
                          config: Record<string, any>, variablesFile: string, secretsFile: string,
                          pluginName: string, pluginCreator: CPMPluginCreator) => {
    const ctx: CPMContext = {
        config: Object.freeze(config),
        variables: new FileBasedKeyValueStore(variablesFile, `plugin:${pluginName}`),
        secrets: new FileBasedKeyValueStore(secretsFile, `plugin:${pluginName}`),
        execute: (name, input) => {
            const action = actions[name];
            return action(input);
        }
    }

    const plugin = await pluginCreator(ctx);
    const configure: Action = plugin.configure || ((ctx, input) => {
        console.log('nothing to configure');
        return {};
    });

    actions[`${pluginName} configure`] = async (input) => await configure(ctx, input);

    Object.entries(plugin.commands || {}).forEach(([name, command]) => {
        commands[`${plugin.name} ${name}`] = command;
    });

    Object.entries(plugin.actions).forEach(([name, action]) => {
        actions[name] = async (input) => await action(ctx, input);
    });
}

const loadCommand = async (actions: Record<string, any>, name: string, targetAction: string,
                           node: TreeNode<CommandDef>): Promise<Command> => {
    const command = new Command(name);

    if (node.current) {
        parseCommand(command, node.current, actions[targetAction]);
    } else {
        for (let subName of Object.keys(node.children)) {
            const subCommand = await loadCommand(actions, subName, `${targetAction} ${subName}`,
                node.children[subName]);
            command.addCommand(subCommand);
        }
    }

    return command;
}

const loadLibVersion = async (): Promise<string> => {
    try {
        // @ts-ignore
        return (await import('./version.ts'))['LIB_VERSION']
    } catch (err) {
        return "0.0.0";
    }
}

const run = async () => {
    const version = await loadLibVersion();

    const program = new Command()
        .name('cpm')
        .version(version)
        .description("CloudImpl project manager | Your partner in project managing");

    // Add global files
    createFolder(globalFolderPath);
    createFile(globalPackageJsonFile, '{}');

    // Add initial cpm.yml
    if (!existsSync(globalConfigFilePath)) {
        createFolder(defaultProjectsRootPath);
        const initialConfig = {
            rootDir: defaultProjectsRootPath
        };
        writeYaml(globalConfigFilePath, initialConfig);
    }

    if (isProjectRepo) {
        createFolder(folderPath);
        createFile(packageJsonFile, '{}');
    }

    // Generate merged config
    const globalConfig: Record<string, any> = readYaml(globalConfigFilePath, {});
    globalConfig.globalPlugins = globalConfig.plugins;
    delete globalConfig.plugins;
    globalConfig.globalWorkflows = globalConfig.workflows;
    delete globalConfig.workflows;

    const localConfig: Record<string, any> = isProjectRepo
        ? readYaml(configFilePath, {})
        : {};

    const config: Record<string, any> = {};
    Object.assign(config, globalConfig);
    Object.assign(config, localConfig);

    // Try to auto sync project
    await autoSync(config);

    const variablesFile = isProjectRepo ? variablesFilePath : globalVariablesFilePath;
    const secretsFile = isProjectRepo ? secretsFilePath : globalSecretsFilePath;

    const commands: Record<string, CommandDef> = cpmCommands;
    const actions: Record<string, CommandAction> = {};

    // Register inbuilt plugins
    for (const p of plugins) {
        await loadPlugin(actions, commands, config, variablesFile, secretsFile, p.name, p.creator);
    }

    // Register global plugins
    for (const p of (config?.globalPlugins || [])) {
        await loadDynamicPlugin(actions, commands, config, variablesFile, secretsFile, globalPluginRoot, p);
    }

    // Register local plugins
    for (const p of (config?.plugins || [])) {
        await loadDynamicPlugin(actions, commands, config, variablesFile, secretsFile, pluginRoot, p);
    }

    // Register global workflows
    const globalWorkflows: Record<string, Workflow> = config.globalWorkflows || [];
    Object.entries(globalWorkflows).forEach(([key, value]) => {
        commands[`exec ${key}`] = createWorkflowCommand(value);
        actions[`exec ${key}`] = input => runWorkflow(value, input);
    });

    // Register local workflows
    const workflows: Record<string, Workflow> = config.workflows || [];
    Object.entries(workflows).forEach(([key, value]) => {
        commands[`exec ${key}`] = createWorkflowCommand(value);
        actions[`exec ${key}`] = input => runWorkflow(value, input);
    });

    // Register commands
    const commandNodes = convertFlatToTree(commands).children;
    for (const name of Object.keys(commandNodes)) {
        const node: TreeNode<CommandDef> = commandNodes[name];
        const command = await loadCommand(actions, name, name, node);
        program.addCommand(command);
    }

    // process.on('exit', cleanup);

    program
        .on('command:*', function () {
            console.error('Unknown command: %s\n\n' +
                'See --help for a list of available commands\n' +
                'Or you may have a missing plugin.\n\n' +
                'Dont worry we will fix this together ;)', program.args.join(' '));
            process.exit(1);
        })
        .parse(process.argv);
}

run().then();