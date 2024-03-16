import {Command} from "commander";

const task = new Command('task');
task
    .command('list')
    .alias('ls')
    .description('list tasks')
    .action(() => {
        console.log('list tasks');
    });
task
    .command('checkout <id>')
    .alias('ck')
    .description('checkout task with id')
    .action((id) => {
        console.log(`checkout task with id ${id}`);
    });

const plugin = {
    name: () => 'clickup',
    commands: () => [task]
}

export default plugin;