import figlet from 'figlet';
import {Command} from "commander";
import {CPMContext, CPMPluginCreator, Workflow} from ".";
import {addMapKey, CommandAction, computeIfNotExist, createFolder, cwd, readJson, writeJson} from "./util";
import commands from './commands';
import {existsSync} from "fs";
import * as os from "os";
import WorkflowInit from "./workflow";

const getSecrets = (secrets: any, namespace: string) => {
    return computeIfNotExist(secrets, namespace, {});
}

const isProjectRepo = existsSync(`${cwd}/cpm.json`);

const run = async () => {
    const program = new Command()
        .version("1.0.0")
        .description("CloudImpl project manager | Your partner in project managing");

    const globalConfig: Record<string, any> = readJson(`${os.homedir()}/.cpm/cpm.json`, {});
    const globalSecrets: Record<string, any> = readJson(`${os.homedir()}/.cpm/secrets.json`, {});

    let localConfig: Record<string, any> = {};
    let localSecrets: Record<string, any> = {};

    if (isProjectRepo) {
        createFolder(`${cwd}/.cpm`);
        localConfig = readJson(`${cwd}/cpm.json`, {});
        localSecrets = readJson(`${cwd}/.cpm/secrets.json`, {});
    }

    const config: Record<string, any> = {};
    Object.assign(config, globalConfig);
    Object.assign(config, localConfig);
    config.globalPlugins = globalConfig.plugins;
    config.globalWorkflows = globalConfig.workflows;

    const actions: Record<string, any> = {};

    // Register global plugins
    for (const p of (config?.globalPlugins || [])) {
        const pluginCreator = ((await import(`${os.homedir()}/.cpm/node_modules/${p}`)).default as CPMPluginCreator);

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

    if (existsSync(`${cwd}/cpm.json`)) {

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

    writeJson(`${os.homedir()}/.cpm/secrets.json`, globalSecrets);
    if (isProjectRepo) {
        writeJson(`${cwd}/.cpm/secrets.json`, localSecrets);
    }

    if (!process.argv.slice(2).length) {
        console.log(figlet.textSync('cpm'));
        program.outputHelp();
    }
}

run().then();