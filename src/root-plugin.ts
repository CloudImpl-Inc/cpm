import {CPMPluginCreator} from "./index";
import {readdirSync} from "fs";
import {
    computeIfNotExist, configFilePath,
    executeShellCommand,
    globalConfigFilePath,
    globalFolderPath,
    isProjectRepo,
    readYaml, writeYaml
} from "./util";

const init: CPMPluginCreator = ctx => {
    return {
        name: "cpm/root",
        actions: {
            "list": (ctx, input) => {
                readdirSync(ctx.config.rootDir, { withFileTypes: true })
                    .filter(orgDir => orgDir.isDirectory())
                    .forEach(orgDir => {
                        console.log(`|--${orgDir.name}`)
                        readdirSync(`${orgDir.path}/${orgDir.name}`, { withFileTypes: true })
                            .filter(repoDir => repoDir.isDirectory())
                            .forEach(repoDir => console.log(`|  |--${repoDir.name} => ${repoDir.path}/${repoDir.name}`))
                    })

                return {};
            },
            "sync": (ctx, input) => {
                if (isProjectRepo) {
                    executeShellCommand('npm install');
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin add": (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
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

                return {};
            },
            "plugin remove": (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
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

                return {};
            }
        }
    }
}

export default init;