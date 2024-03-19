import {
    CommandInit, computeIfNotExist, configFilePath,
    executeShellCommand,
    globalConfigFilePath,
    globalFolderPath,
    isProjectRepo,
    readYaml, writeYaml
} from "../util";
import {Command, OptionValues} from "commander";
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

    const install = new Command('install')
        .argument('<plugin>')
        .description('install cpm plugin')
        .option('-g, --global', 'install plugin globally')
        .action((plugin: string, opts: OptionValues) => {
            if (opts.global) {
                process.chdir(globalFolderPath);
                const config = readYaml(globalConfigFilePath, {})
                const plugins = computeIfNotExist(config, 'plugins', []);

                if (!plugins.includes(plugin)) {
                    executeShellCommand(`npm install ${plugin} --save-dev`);
                    plugins.push(plugin);
                    writeYaml(globalConfigFilePath, config);
                }
            } else if (isProjectRepo) {
                const config = readYaml(configFilePath, {})
                const plugins = computeIfNotExist(config, 'plugins', []);

                if (!plugins.includes(plugin)) {
                    executeShellCommand(`npm install ${plugin} --save-dev`);
                    plugins.push(plugin);
                    writeYaml(configFilePath, config);
                }
            } else {
                throw new Error('not a project folder');
            }
        })

    const uninstall = new Command('uninstall')
        .argument('<plugin>')
        .description('uninstall cpm plugin')
        .option('-g, --global', 'uninstall plugin globally')
        .action((plugin: string, opts: OptionValues) => {
            if (opts.global) {
                process.chdir(globalFolderPath);
                const config = readYaml(globalConfigFilePath, {})
                const plugins = computeIfNotExist(config, 'plugins', []);

                if (plugins.includes(plugin)) {
                    executeShellCommand(`npm uninstall ${plugin} --save-dev`);

                    const index = plugins.indexOf(plugin);
                    if (index > -1) {
                        plugins.splice(index, 1);
                    }

                    writeYaml(globalConfigFilePath, config);
                }
            } else if (isProjectRepo) {
                const config = readYaml(configFilePath, {})
                const plugins = computeIfNotExist(config, 'plugins', []);

                if (plugins.includes(plugin)) {
                    executeShellCommand(`npm uninstall ${plugin} --save-dev`);

                    const index = plugins.indexOf(plugin);
                    if (index > -1) {
                        plugins.splice(index, 1);
                    }

                    writeYaml(configFilePath, config);
                }
            } else {
                throw new Error('not a project folder');
            }
        })

    const sync = new Command('sync')
        .description('sync cpm plugin')
        .action(() => {
            if (isProjectRepo) {
                executeShellCommand('npm install');
            } else {
                throw new Error('not a project folder');
            }
        })

    return [ls, cd, install, uninstall, sync];
}

export default {
    name: 'root',
    init: init,
};