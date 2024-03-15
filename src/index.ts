#! /usr/bin/env node

import figlet from 'figlet';
import {Command} from "commander";
import TaskCommand from './task';

console.log(figlet.textSync('cpm'));

const program = new Command();

program
    .version("1.0.0")
    .description("CloudImpl project manager | Your partner in project managing");

// Register commands
program.addCommand(TaskCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
