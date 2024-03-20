import {Command} from "commander";
import {CPMContext, CPMPluginCreator, Workflow} from ".";
import {
    CommandAction,
    computeIfNotExist,
    configFilePath, convertFlatToTree,
    createFolder,
    defaultProjectsRootPath, executeCommand,
    folderPath,
    globalConfigFilePath,
    globalFolderPath,
    globalPluginRoot,
    globalSecretsFilePath,
    isProjectRepo, parseCommand,
    pluginRoot,
    readJson,
    readYaml,
    secretsFilePath, TreeNode,
    writeJson,
    writeYaml
} from "./util";
import RootPlugin from './root-plugin';
import commands, {CommandDef} from './commands';
import WorkflowInit from "./workflow";
import {existsSync} from "fs";

const getSecrets = (secrets: any, namespace: string) => {
    return computeIfNotExist(secrets, namespace, {});
}

const loadDynamicPlugin = async (actions: Record<string, CommandAction>, config: Record<string, any>,
                                 secrets: Record<string, any>, pluginRoot: string, pluginName: string) => {
    const pluginPath = `${pluginRoot}/${pluginName}`;

    try {
        const pluginCreator = ((await import(`${pluginRoot}/${pluginName}`)).default as CPMPluginCreator);
        await loadPlugin(actions, config, secrets, pluginName, pluginCreator);
    } catch (err) {
        console.error(`error loading plugin ${pluginPath}`);
        console.error(err);
    }
}

const loadPlugin = async (actions: Record<string, CommandAction>, config: Record<string, any>, secrets: Record<string, any>,
                          pluginName: string, pluginCreator: CPMPluginCreator) => {
    const ctx: CPMContext = {
        config: Object.freeze(config),
        secrets: getSecrets(secrets, `plugin:${pluginName}`),
    }

    const plugin = await pluginCreator(ctx);
    Object.keys(plugin.actions).forEach(command => {
        const action = plugin.actions[command];
        actions[command] = async (input) => await action(ctx, input);
    })
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

const loadWorkflow = async (program: Command, config: Record<string, any>, secrets: Record<string, any>,
                            workflowName: string, workflow: Workflow) => {
    const ctx: CPMContext = {
        config: Object.freeze(config),
        secrets: getSecrets(secrets, `workflow:${workflowName}`),
    }

    const c = await WorkflowInit(ctx, workflowName, workflow)
    program.addCommand(c);
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

    // Add initial cpm.yml
    if (!existsSync(globalConfigFilePath)) {
        createFolder(defaultProjectsRootPath);
        const initialConfig = {
            rootDir: defaultProjectsRootPath
        };
        writeYaml(globalConfigFilePath, initialConfig);
    }

    const globalConfig: Record<string, any> = readYaml(globalConfigFilePath, {});
    const globalSecrets: Record<string, any> = readJson(globalSecretsFilePath, {});

    let localConfig: Record<string, any> = {};
    let localSecrets: Record<string, any> = {};

    if (isProjectRepo) {
        createFolder(folderPath);
        localConfig = readYaml(configFilePath, {});
        localSecrets = readJson(secretsFilePath, {});
    }

    const config: Record<string, any> = {};
    Object.assign(config, globalConfig);
    Object.assign(config, localConfig);
    config.globalPlugins = globalConfig.plugins;
    config.globalWorkflows = globalConfig.workflows;

    const actions: Record<string, CommandAction> = {};

    // Register root plugin
    await loadPlugin(actions, config, globalSecrets, "cpm/root", RootPlugin);

    // Register global plugins
    for (const p of (config?.globalPlugins || [])) {
        await loadDynamicPlugin(actions, config, globalSecrets, globalPluginRoot, p);
    }

    // Register local plugins
    for (const p of (config?.plugins || [])) {
        await loadDynamicPlugin(actions, config, localSecrets, pluginRoot, p);
    }

    // Register commands
    const commandNodes = convertFlatToTree(commands).children;
    for (const name of Object.keys(commandNodes)) {
        const node: TreeNode<CommandDef> = commandNodes[name];
        const command = await loadCommand(actions, name, name, node);
        program.addCommand(command);
    }

    // Register global workflows
    for (const name of Object.keys(config?.globalWorkflows || {})) {
        await loadWorkflow(program, config, globalSecrets, name, config.globalWorkflows[name]);
    }

    // Register local workflows
    for (const name of Object.keys(config?.workflows || {})) {
        await loadWorkflow(program, config, localSecrets, name, config.workflows[name]);
    }

    program
        .on('command:*', function () {
            console.error('Unknown command: %s\n\n' +
                'See --help for a list of available commands\n' +
                'Or you may have a missing plugin.\n\n' +
                'Dont worry we will fix this together ;)', program.args.join(' '));
            process.exit(1);
        })
        .parse(process.argv);

    writeJson(globalSecretsFilePath, globalSecrets);
    if (isProjectRepo) {
        writeJson(secretsFilePath, localSecrets);
    }

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

run().then();