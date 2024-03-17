import {CommandInit, computeIfNotExist, executeCommand, readJson} from "../util";
import {Command} from "commander";
import {readdirSync} from "fs";
import os from "os";

const globalConfig: Record<string, any> = Object.freeze(readJson(`${os.homedir()}/.cpm/cpm.json`, {}));
const rootDir = globalConfig.rootDir;

const init: CommandInit = actions => {
    const list = new Command('list')
        .description('list projects')
        .action(async () => {
            readdirSync(rootDir, { withFileTypes: true })
                .filter(orgDir => orgDir.isDirectory())
                .forEach(orgDir => {
                    console.log(`|--${orgDir.name}`)
                    readdirSync(`${orgDir.path}/${orgDir.name}`, { withFileTypes: true })
                        .filter(repoDir => repoDir.isDirectory())
                        .forEach(repoDir => console.log(`|  |--${repoDir.name} => ${repoDir.path}/${repoDir.name}`))
                })
        });

    return [list];
}

export default init;