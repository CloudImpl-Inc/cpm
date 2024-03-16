import figlet from 'figlet';
import {Command} from "commander";
import {config, CPMPlugin} from ".";

const program = new Command();

program
    .version("1.0.0")
    .description("CloudImpl project manager | Your partner in project managing");

const loadPlugins = async () => {
    // Register plugins
    for (const p of config.plugins) {
        const plugin = ((await import(`${process.cwd()}/node_modules/${p}`)).default as CPMPlugin);
        console.log(`registering plugin: ${plugin.name()}`)
        plugin.commands().forEach(c => {
            program.addCommand(c);
            console.log(`command registered: ${c.name()}`)
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
    if (!process.argv.slice(2).length) {
        console.log(figlet.textSync('cpm'));
        program.outputHelp();
    }
})