import {Command} from "commander";

const workingDirectory = process.cwd()

const task = new Command('task');
task
    .command('list')
    .alias('ls')
    .description('list tasks')
    .action(async () => {
        const action = await import(`${workingDirectory}/task-list`);
        action.default({}, {});
    });
task
    .command('checkout <id>')
    .alias('ck')
    .description('checkout task with id')
    .action(async (id) => {
        const action = await import(`${workingDirectory}/task-checkout`);
        action.default({id}, {});
    });

export default task;