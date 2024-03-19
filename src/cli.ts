import {Command} from "commander";
import {CPMContext, CPMPluginCreator, Workflow} from ".";
import {
    addMapKey,
    CommandAction,
    computeIfNotExist,
    configFilePath, CPMCommand,
    createFolder,
    defaultProjectsRootPath,
    folderPath,
    globalConfigFilePath,
    globalFolderPath,
    globalPluginRoot,
    globalSecretsFilePath,
    isProjectRepo, pluginRoot,
    readJson,
    readYaml,
    secretsFilePath,
    writeJson,
    writeYaml
} from "./util";
import commands from './commands';
import WorkflowInit from "./workflow";
import {existsSync} from "fs";

const getSecrets = (secrets: any, namespace: string) => {
    return computeIfNotExist(secrets, namespace, {});
}

const loadPlugin = async (actions: Record<string, any>, config: Record<string, any>, secrets: Record<string, any>,
                          pluginRoot: string, pluginName: string) => {
    const pluginPath = `${pluginRoot}/${pluginName}`;

    try {
        const pluginCreator = ((await import(`${pluginRoot}/${pluginName}`)).default as CPMPluginCreator);

        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(secrets, `plugin:${pluginName}`),
        }

        const plugin = await pluginCreator(ctx);
        Object.keys(plugin.actions).forEach(command => {
            const key = command.split(' ');
            const action = plugin.actions[command];
            const commandAction: CommandAction = async (input) => await action(ctx, input);
            addMapKey(actions, key, commandAction);
        })
    } catch (err) {
        console.error(`error loading plugin ${pluginPath}`);
        console.error(err);
    }
}

const loadCommand = async (program: Command, actions: Record<string, any>, config: Record<string, any>,
                           secrets: Record<string, any>, command: CPMCommand) => {
    const ctx: CPMContext = {
        config: Object.freeze(config),
        secrets: getSecrets(secrets, `command:${command.name}`),
    }

    const cmdList = await command.init(ctx, actions);
    cmdList.forEach(c => program.addCommand(c));
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

const run = async () => {
    const program = new Command()
        .version("1.0.0")
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

    const actions: Record<string, any> = {};

    // Register global plugins
    for (const p of (config?.globalPlugins || [])) {
        await loadPlugin(actions, config, globalSecrets, globalPluginRoot, p);
    }

    // Register local plugins
    for (const p of (config?.plugins || [])) {
        await loadPlugin(actions, config, localSecrets, pluginRoot, p);
    }

    // Register commands
    for (const command of commands) {
        await loadCommand(program, actions, config, globalSecrets, command);
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