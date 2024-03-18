import {CommandInit, computeIfNotExist, executeCommand} from "../util";
import {Command} from "commander";

const init: CommandInit = (ctx, actions) => {
    const m = computeIfNotExist(actions, 'task', {})
    const task = new Command('task');

    task
        .command('ls')
        .description('list tasks')
        .action(async () => {
            const action = computeIfNotExist(m, 'list', undefined)
            await executeCommand(action, {args: {}, options: {}}, [])
        });

    task
        .command('get <id>')
        .description('get task with id')
        .action(async (id) => {
            const action = computeIfNotExist(m, 'get', undefined)
            await executeCommand(action, {args: {id}, options: {}}, ['id', 'title']);
        });

    task
        .command('status <id> <status>')
        .description('update task status with id')
        .action(async (id, status) => {
            const action = computeIfNotExist(m, 'status', undefined)
            await executeCommand(action, {args: {id, status}, options: {}}, []);
        });

    return [task];
}

export default {
    name: 'task',
    init: init,
};