import {CommandInit, computeIfNotExist, executeCommand} from "../util";
import {Command} from "commander";

const init: CommandInit = (program, actions) => {
    const m = computeIfNotExist(actions, 'task', {})
    const task = new Command('task');

    task
        .command('list')
        .alias('ls')
        .description('list tasks')
        .action(async () => {
            const action = computeIfNotExist(m, 'list', undefined)
            await executeCommand(action, {args: {}, options: {}})
        });

    task
        .command('checkout <id>')
        .alias('ck')
        .description('checkout task with id')
        .action(async (id) => {
            const action = computeIfNotExist(m, 'checkout', undefined)
            await executeCommand(action, {args: {id}, options: {}})
        });
}

export default init;