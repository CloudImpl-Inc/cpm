import {ActionOutput, CPMConfig, CPMPlugin} from "./index";
import {readdirSync} from "fs";
import {
    CommandAction,
    computeIfNotExist, configFilePath, createFolder,
    executeShellCommand, folderPath,
    globalConfigFilePath,
    globalFolderPath,
    isProjectRepo, readYaml, writeJson, writeYaml
} from "./util";
import chalk from 'chalk';

type RootPluginCreator = (actions: Record<string, CommandAction>) => CPMPlugin | Promise<CPMPlugin>;

const init: RootPluginCreator = actions => {
    return {
        name: "root",
        actions: {
            "init": async (ctx, input) => {
                if (isProjectRepo) {
                    console.log(chalk.yellow('already initialized'));
                } else {
                    const config: CPMConfig = {
                        plugins: []
                    }
                    writeYaml(configFilePath, config);
                    createFolder(folderPath);
                    writeJson(`${folderPath}/package.json`, {});
                    console.log(chalk.green('cpm project initialized'));
                }
                return {};
            },
            "find": (ctx, input): ActionOutput => {
                const {query} = input.args;

                for (const orgDir of readdirSync(ctx.config.rootDir, {withFileTypes: true})) {
                    if (!orgDir.isDirectory()) {
                        continue;
                    }

                    for (const repoDir of readdirSync(`${orgDir.path}/${orgDir.name}`, {withFileTypes: true})) {
                        const path = `${repoDir.path}/${repoDir.name}`;

                        if (orgDir.isDirectory() && path.toLowerCase().endsWith(query.toLowerCase())) {
                            const [org, repo] = path.split('/').slice(-2);
                            console.log(path);
                            return {org, repo, path};
                        }
                    }
                }

                return {};
            },
            "list": (ctx, input) => {
                readdirSync(ctx.config.rootDir, {withFileTypes: true})
                    .filter(orgDir => orgDir.isDirectory())
                    .forEach(orgDir => {
                        console.log(`|--${orgDir.name}`)
                        readdirSync(`${orgDir.path}/${orgDir.name}`, {withFileTypes: true})
                            .filter(repoDir => repoDir.isDirectory())
                            .forEach(repoDir => console.log(`|  |--${repoDir.name} => ${repoDir.path}/${repoDir.name}`))
                    })

                return {};
            },
            "sync": async (ctx, input) => {
                if (isProjectRepo) {
                    await executeShellCommand('npm install', {cwd: folderPath});

                    if (ctx.config.flow?.enabled) {
                        await executeShellCommand('cpm flow setup');
                    }
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin list": async (ctx, input) => {
                if (input.options.global) {
                    await executeShellCommand('npm list --depth=0', {
                        cwd: globalFolderPath
                    });
                } else if (isProjectRepo) {
                    await executeShellCommand('npm list --depth=0', {
                        cwd: folderPath
                    });
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin add": async (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
                    const config = readYaml(globalConfigFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (!plugins.includes(plugin)) {
                        await executeShellCommand(`npm install ${plugin} --save-dev`, {
                            cwd: globalFolderPath
                        });
                        plugins.push(plugin);
                        writeYaml(globalConfigFilePath, config);
                    } else {
                        console.log('plugin already installed');
                    }
                } else if (isProjectRepo) {
                    const config = readYaml(configFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (!plugins.includes(plugin)) {
                        await executeShellCommand(`npm install ${plugin} --save-dev`, {
                            cwd: folderPath
                        });
                        plugins.push(plugin);
                        writeYaml(configFilePath, config);
                    } else {
                        console.log('plugin already installed');
                    }
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin remove": async (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
                    const config = readYaml(globalConfigFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (plugins.includes(plugin)) {
                        await executeShellCommand(`npm uninstall ${plugin} --save-dev`, {
                            cwd: globalFolderPath
                        });

                        const index = plugins.indexOf(plugin);
                        if (index > -1) {
                            plugins.splice(index, 1);
                        }

                        writeYaml(globalConfigFilePath, config);
                    } else {
                        console.log('plugin not installed');
                    }
                } else if (isProjectRepo) {
                    const config = readYaml(configFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (plugins.includes(plugin)) {
                        await executeShellCommand(`npm uninstall ${plugin} --save-dev`, {
                            cwd: folderPath
                        });

                        const index = plugins.indexOf(plugin);
                        if (index > -1) {
                            plugins.splice(index, 1);
                        }

                        writeYaml(configFilePath, config);
                    } else {
                        console.log('plugin not installed');
                    }
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin configure": async (ctx, input) => {
                const plugin = input.args.plugin;
                return actions[`${plugin} configure`]({args: {}, options: {}});
            }
        }
    }
}

export default init;