import {CommandInit, computeIfNotExist, executeCommand} from "../util";
import {Command} from "commander";

const init: CommandInit = actions => {
    const list = new Command('list')
        .description('list projects')
        .action(async () => {
            const action = computeIfNotExist(actions, 'list', undefined)
            await executeCommand(action, {args: {}, options: {}})
        });

    return [list];
}

export default init;