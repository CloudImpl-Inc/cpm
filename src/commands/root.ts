import {CommandAction, CommandInit, executeCommand, readJson} from "../util";
import {Command} from "commander";
import * as os from "os";
import {readdirSync} from "fs";

const config: Record<string, any> = Object.freeze(readJson(`${os.homedir()}/cpm.json`, {}));
const rootDir = config.rootDir;

const listAction: CommandAction = input => {
    readdirSync(rootDir, { withFileTypes: true })
        .filter(orgDir => orgDir.isDirectory())
        .forEach(orgDir => {
            console.log(`|--${orgDir.name}`)
            readdirSync(`${orgDir.path}/${orgDir.name}`, { withFileTypes: true })
                .filter(repoDir => repoDir.isDirectory())
                .forEach(repoDir => console.log(`|  |--${repoDir.name} => ${repoDir.path}/${repoDir.name}`))
        })

    return {};
}

const init: CommandInit = actions => {
    const ls = new Command('ls')
        .description('list projects')
        .action(async () => {
            await executeCommand(listAction, {args: {}, options: {}})
        });

    return [ls];
}

export default init;