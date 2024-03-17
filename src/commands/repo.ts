import {CommandInit, computeIfNotExist, executeCommand} from "../util";
import {Command} from "commander";

const init: CommandInit = actions => {
    const m = computeIfNotExist(actions, 'repo', {})
    const repo = new Command('repo');

    repo
        .command('clone <url>')
        .description('clone project repository')
        .action(async (url) => {
            const action = computeIfNotExist(m, 'clone', undefined)
            await executeCommand(action, {args: {url}, options: {}}, ['org', 'repo'])
        });

    repo
        .command('checkout')
        .description('checkout branch in repository')
        .option('-b, --branch <branch>')
        .action(async (options) => {
            const action = computeIfNotExist(m, 'checkout', undefined)
            await executeCommand(action, {args: {}, options}, [])
        });

    return [repo];
}

export default init;