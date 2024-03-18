import {CommandInit} from "../util";
import {Command} from "commander";
import {readdirSync} from "fs";

const init: CommandInit = (ctx, actions) => {
    const rootDir = ctx.config.rootDir;

    const ls = new Command('ls')
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

    const cd = new Command('cd')
        .argument('<path>')
        .description('go to project directory')
        .action(async (path) => {
            process.chdir(path);
        });

    return [ls, cd];
}

export default {
    name: 'root',
    init: init,
};