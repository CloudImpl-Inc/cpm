import figlet from 'figlet';
import {Command} from "commander";
import {ActionInput, CPMPluginContext, CPMPluginCreator} from ".";
import {addMapKey, computeIfNotExist, createFolder, readJson, writeJson} from "./util";
import commands from './commands';

const getPluginSecrets = (secrets: any, name: string) => {
    return computeIfNotExist(secrets, name, {});
}

const run = async () => {
    const config: Record<string, any> = Object.freeze(readJson(`${process.cwd()}/cpm.json`, {}));

    createFolder(`${process.cwd()}/.cpm`);
    const secrets = readJson(`${process.cwd()}/.cpm/secrets.json`, {});

    const program = new Command()
        .version("1.0.0")
        .description("CloudImpl project manager | Your partner in project managing");

    const actions: Record<string, any> = {};

    // Register actions
    for (const p of config.plugins) {
        const pluginCreator = ((await import(`${process.cwd()}/node_modules/${p}`)).default as CPMPluginCreator);

        const ctx: CPMPluginContext = {
            config,
            secrets: getPluginSecrets(secrets, p),
        }

        const plugin = await pluginCreator(ctx);
        Object.keys(plugin.actions).forEach(command => {
          const key = command.split(' ');
          const action = plugin.actions[command];
          const commandAction = (input: ActionInput) => action(ctx, input);
          addMapKey(actions, key, commandAction);
        })
    }

    // Register commands
    for (const init of commands) {
        const commands = await init(actions);
        commands.forEach(c => {
            program.addCommand(c);
        });
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

    writeJson(`${process.cwd()}/.cpm/secrets.json`, secrets);

    if (!process.argv.slice(2).length) {
        console.log(figlet.textSync('cpm'));
        program.outputHelp();
    }
}

run().then();