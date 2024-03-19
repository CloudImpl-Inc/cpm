import {Command} from "commander";
import {CPMContext, CPMPluginCreator, Workflow} from ".";
import {
    addMapKey,
    CommandAction,
    computeIfNotExist, configFilePath,
    createFolder,
    cwd, folderPath, globalConfigFilePath, globalFolderPath, globalSecretsFilePath,
    isProjectRepo,
    readJson, readYaml, secretsFilePath,
    writeJson
} from "./util";
import commands from './commands';
import WorkflowInit from "./workflow";

const getSecrets = (secrets: any, namespace: string) => {
    return computeIfNotExist(secrets, namespace, {});
}

const run = async () => {
    const program = new Command()
        .version("1.0.0")
        .description("CloudImpl project manager | Your partner in project managing");

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
        const pluginCreator = ((await import(`${globalFolderPath}/node_modules/${p}`)).default as CPMPluginCreator);

        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(globalSecrets, `plugin:${p}`),
        }

        const plugin = await pluginCreator(ctx);
        Object.keys(plugin.actions).forEach(command => {
            const key = command.split(' ');
            const action = plugin.actions[command];
            const commandAction: CommandAction = async (input) => await action(ctx, input);
            addMapKey(actions, key, commandAction);
        })
        console.log(`global plugin ${p} loaded`);
    }

    // Register local plugins
    for (const p of (config?.plugins || [])) {
        const pluginCreator = ((await import(`${cwd}/node_modules/${p}`)).default as CPMPluginCreator);

        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(localSecrets, `plugin:${p}`),
        }

        const plugin = await pluginCreator(ctx);
        Object.keys(plugin.actions).forEach(command => {
            const key = command.split(' ');
            const action = plugin.actions[command];
            const commandAction: CommandAction = async (input) => await action(ctx, input);
            addMapKey(actions, key, commandAction);
        })

        console.log(`plugin ${p} loaded`);
    }

    // Register commands
    for (const command of commands) {
        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(globalSecrets, `command:${command.name}`),
        }

        const cmdList = await command.init(ctx, actions);
        cmdList.forEach(c => program.addCommand(c));
    }

    // Register global workflows
    for (const name of Object.keys(config?.globalWorkflows || {})) {
        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(globalSecrets, `workflow:${name}`),
        }

        const w: Workflow = config.globalWorkflows[name];
        const c = await WorkflowInit(ctx, name, w)
        program.addCommand(c);
    }

    // Register local workflows
    for (const name of Object.keys(config?.workflows || {})) {
        const ctx: CPMContext = {
            config: Object.freeze(config),
            secrets: getSecrets(localSecrets, `workflow:${name}`),
        }

        const w: Workflow = config.workflows[name];
        const c = await WorkflowInit(ctx, name, w)
        program.addCommand(c);
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