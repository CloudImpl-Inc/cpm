import figlet from 'figlet';
import {Command} from "commander";
import {ActionInput, CPMPluginContext, CPMPluginCreator, Workflow} from ".";
import {addMapKey, CommandAction, computeIfNotExist, createFolder, readJson, writeJson} from "./util";
import commands from './commands';
import {existsSync} from "fs";
import * as os from "os";
import WorkflowInit from "./workflow";

const getPluginSecrets = (secrets: any, name: string) => {
    return computeIfNotExist(secrets, name, {});
}

const run = async () => {
    const program = new Command()
        .version("1.0.0")
        .description("CloudImpl project manager | Your partner in project managing");

    const cwd = process.cwd();

    const globalConfig: Record<string, any> = Object.freeze(readJson(`${os.homedir()}/.cpm/cpm.json`, {}))
    const localConfig: Record<string, any> = Object.freeze(readJson(`${cwd}/cpm.json`, {}));

    const globalSecrets: Record<string, any> = readJson(`${os.homedir()}/.cpm/secrets.json`, {})
    let localSecrets: Record<string, any> = {};

    const actions: Record<string, any> = {};

    // Register global actions
    for (const p of globalConfig.plugins) {
        const pluginCreator = ((await import(`${os.homedir()}/.cpm/node_modules/${p}`)).default as CPMPluginCreator);

        const ctx: CPMPluginContext = {
            config: globalConfig,
            secrets: getPluginSecrets(globalSecrets, p),
        }

        const plugin = await pluginCreator(ctx);
        Object.keys(plugin.actions).forEach(command => {
            const key = command.split(' ');
            const action = plugin.actions[command];
            const commandAction: CommandAction = async (input: ActionInput) => {
                const result = await action(ctx, input);
                const outputPath = process.env.OUTPUT;

                if (outputPath && outputPath !== '') {
                    writeJson(outputPath, result)
                }
            }
            addMapKey(actions, key, commandAction);
        })
    }

    if (existsSync(`${cwd}/cpm.json`)) {
        createFolder(`${cwd}/.cpm`);
        localSecrets = readJson(`${cwd}/.cpm/secrets.json`, {})

        // Register actions
        for (const p of localConfig.plugins) {
            const pluginCreator = ((await import(`${cwd}/node_modules/${p}`)).default as CPMPluginCreator);

            const ctx: CPMPluginContext = {
                config: localConfig,
                secrets: getPluginSecrets(localSecrets, p),
            }

            const plugin = await pluginCreator(ctx);
            Object.keys(plugin.actions).forEach(command => {
                const key = command.split(' ');
                const action = plugin.actions[command];
                const commandAction = async (input: ActionInput) => {
                    const result = await action(ctx, input);
                    const outputPath = process.env.OUTPUT;

                    if (outputPath && outputPath !== '') {
                        writeJson(outputPath, result)
                    }
                }
                addMapKey(actions, key, commandAction);
            })
        }
    }

    // Register commands
    for (const init of commands) {
        const commands = await init(actions);
        commands.forEach(c => {
            program.addCommand(c);
        });
    }

    if (existsSync(`${cwd}/cpm.json`)) {
        // Register workflows
        for (const name of Object.keys(localConfig.workflows)) {
            const w: Workflow = localConfig.workflows[name];
            const c = await WorkflowInit(name, w)
            program.addCommand(c);
        }
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

    if (existsSync(`${cwd}/cpm.json`)) {
        writeJson(`${cwd}/.cpm/secrets.json`, localSecrets);
    }

    if (!process.argv.slice(2).length) {
        console.log(figlet.textSync('cpm'));
        program.outputHelp();
    }
}

run().then();