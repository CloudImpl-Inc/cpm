import {Command} from "commander";
import {Action, CommandDef, CPMContext, CPMPluginCreator, Workflow} from ".";
import {
    CommandAction,
    computeIfNotExist,
    configFilePath, convertFlatToTree, createFile,
    createFolder, createWorkflowCommand,
    defaultProjectsRootPath, folderPath,
    globalConfigFilePath,
    globalFolderPath, globalPackageJsonFile,
    globalPluginRoot,
    globalSecretsFilePath, globalVariablesFilePath,
    isProjectRepo, packageJsonFile, parseCommand,
    pluginRoot,
    readJson,
    readYaml, runWorkflow,
    secretsFilePath, TreeNode, variablesFilePath,
    writeJson,
    writeYaml
} from "./util";
import FlowPlugin from './flow-plugin';
import TemplatePlugin from './template-plugin';
import RootPlugin from './root-plugin';
import cpmCommands from './commands';
import {existsSync} from "fs";
import commands from "./commands";

const getNamespace = (data: any, namespace: string) => {
    return computeIfNotExist(data, namespace, {});
}

const loadDynamicPlugin = async (actions: Record<string, CommandAction>, config: Record<string, any>,
                                 variables: Record<string, string>, secrets: Record<string, string>,
                                 pluginRoot: string, pluginName: string) => {
    const pluginPath = `${pluginRoot}/${pluginName}`;

    try {
        const pluginCreator = ((await import(pluginPath)).default as CPMPluginCreator);
        await loadPlugin(actions, config, variables, secrets, pluginName, pluginCreator);
    } catch (err) {
        console.error(`error loading plugin ${pluginName}`);
        console.error(err);
    }
}

const loadPlugin = async (actions: Record<string, CommandAction>, config: Record<string, any>,
                          variables: Record<string, string>, secrets: Record<string, string>,
                          pluginName: string, pluginCreator: CPMPluginCreator) => {
    const ctx: CPMContext = {
        config: Object.freeze(config),
        variables: getNamespace(variables, `plugin:${pluginName}`),
        secrets: getNamespace(secrets, `plugin:${pluginName}`)
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

const loadRootPlugin = async (actions: Record<string, CommandAction>, config: Record<string, any>,
                              variables: Record<string, string>, secrets: Record<string, string>) => {
    const rootPluginName = 'root';

    const ctx: CPMContext = {
        config: Object.freeze(config),
        variables: getNamespace(variables, `plugin:${rootPluginName}`),
        secrets: getNamespace(secrets, `plugin:${rootPluginName}`)
    }

    const plugin = await RootPlugin(actions);

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
        .version(version)
        .description("CloudImpl project manager | Your partner in project managing");

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

    // Add global package.json
    if (!existsSync(`${globalFolderPath}/package.json`)) {
        writeJson(`${globalFolderPath}/package.json`, {});
    }

    const globalConfig: Record<string, any> = readYaml(globalConfigFilePath, {});
    globalConfig.globalPlugins = globalConfig.plugins;
    delete globalConfig.plugins;
    globalConfig.globalWorkflows = globalConfig.workflows;
    delete globalConfig.workflows;

    const globalVariables: Record<string, string> = readJson(globalVariablesFilePath, {});
    const globalSecrets: Record<string, string> = readJson(globalSecretsFilePath, {});

    let localConfig: Record<string, any> = {};
    let localVariables: Record<string, string> = {};
    let localSecrets: Record<string, string> = {};

    if (isProjectRepo) {
        createFolder(folderPath);
        createFile(packageJsonFile, '{}');

        localConfig = readYaml(configFilePath, {});
        localVariables = readJson(variablesFilePath, {});
        localSecrets = readJson(secretsFilePath, {});
    }

    const config: Record<string, any> = {};
    Object.assign(config, globalConfig);
    Object.assign(config, localConfig);

    const variables = isProjectRepo ? localVariables : globalVariables;
    const secrets = isProjectRepo ? localSecrets : globalSecrets;

    const commands: Record<string, CommandDef> = cpmCommands;
    const actions: Record<string, CommandAction> = {};

    // Register default plugins
    await loadPlugin(actions, config, variables, secrets, 'template', TemplatePlugin);
    await loadPlugin(actions, config, variables, secrets, 'flow', FlowPlugin);

    // Register global plugins
    for (const p of (config?.globalPlugins || [])) {
        await loadDynamicPlugin(actions, config, variables, secrets, globalPluginRoot, p);
    }

    // Register local plugins
    for (const p of (config?.plugins || [])) {
        await loadDynamicPlugin(actions, config, variables, secrets, pluginRoot, p);
    }

    // Register root plugin
    // Root plugin register at last
    await loadRootPlugin(actions, config, variables, secrets);

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

    const cleanup = () => {
        writeJson(globalVariablesFilePath, globalVariables);
        writeJson(globalSecretsFilePath, globalSecrets);
        if (isProjectRepo) {
            writeJson(variablesFilePath, localVariables);
            writeJson(secretsFilePath, localSecrets);
        }
    }

    process.on('exit', cleanup);

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