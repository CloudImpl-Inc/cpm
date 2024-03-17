import figlet from 'figlet';
import {Command} from "commander";
import {config, CPMPluginContext, CPMPluginCreator} from ".";
import {computeIfNotExist, createFolder, readJson, writeJson} from "./util";

createFolder(`${process.cwd()}/.cpm`);
const secrets = readJson(`${process.cwd()}/.cpm/secrets.json`, () => {});

const getPluginSecrets = (name: string) => {
    return computeIfNotExist(secrets, name, k => {});
}

const program = new Command()
    .version("1.0.0")
    .description("CloudImpl project manager | Your partner in project managing");

const loadPlugins = async () => {
    // Register plugins
    for (const p of config.plugins) {
        console.log(`registering plugin: ${p}`)

        const pluginCreator = ((await import(`${process.cwd()}/node_modules/${p}`)).default as CPMPluginCreator);

        const ctx: CPMPluginContext = {
            config,
            secrets: getPluginSecrets(p),
        }

        const plugin = await pluginCreator(ctx);
        plugin.commands().forEach(c => {
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
}

loadPlugins().then(() => {
    writeJson(`${process.cwd()}/.cpm/secrets.json`, secrets);

    if (!process.argv.slice(2).length) {
        console.log(figlet.textSync('cpm'));
        program.outputHelp();
    }
})