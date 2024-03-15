#! /usr/bin/env node

import figlet from 'figlet';
import {Command} from "commander";

console.log(figlet.textSync('cpm'));

const program = new Command();

program
    .version("1.0.0")
    .description("CloudImpl project manager | Your partner in project managing")
    .parse(process.argv);

const options = program.opts();

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
