import figlet from 'figlet';
import {Command} from "commander";
import {config} from ".";

console.log(figlet.textSync('cpm'));

const program = new Command();

program
    .version("1.0.0")
    .description("CloudImpl project manager | Your partner in project managing");

// Register plugins
config.plugins.forEach(async p => {
    const plugin = (await import(p)).default;
    program.addCommand(plugin);
})

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}