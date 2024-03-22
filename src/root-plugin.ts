import {ActionOutput, CPMConfig, CPMPlugin, CPMPluginCreator} from "./index";
import {readdirSync} from "fs";
import {
    CommandAction,
    computeIfNotExist, configFilePath,
    executeShellCommand,
    globalConfigFilePath,
    globalFolderPath,
    isProjectRepo,
    readYaml, writeYaml
} from "./util";

type RootPluginCreator = (actions: Record<string, CommandAction>) => CPMPlugin | Promise<CPMPlugin>;

const init: RootPluginCreator = actions => {
    return {
        name: "root",
        actions: {
            "init": (ctx, input) => {
                if (isProjectRepo) {
                    console.log('already initialized');
                } else {
                    const config: CPMConfig = {
                        plugins: []
                    }
                    writeYaml(configFilePath, config);
                    console.log('cpm project initialized');
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
                    await executeShellCommand('npm install');
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin add": async (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
                    process.chdir(globalFolderPath);
                    const config = readYaml(globalConfigFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (!plugins.includes(plugin)) {
                        await executeShellCommand(`npm install ${plugin} --save-dev`);
                        plugins.push(plugin);
                        writeYaml(globalConfigFilePath, config);
                    }
                } else if (isProjectRepo) {
                    const config = readYaml(configFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (!plugins.includes(plugin)) {
                        await executeShellCommand(`npm install ${plugin} --save-dev`);
                        plugins.push(plugin);
                        writeYaml(configFilePath, config);
                    }
                } else {
                    throw new Error('not a project folder');
                }

                return {};
            },
            "plugin remove": async (ctx, input) => {
                const plugin = input.args.plugin;

                if (input.options.global) {
                    process.chdir(globalFolderPath);
                    const config = readYaml(globalConfigFilePath, {})
                    const plugins = computeIfNotExist(config, 'plugins', []);

                    if (plugins.includes(plugin)) {
                        await executeShellCommand(`npm uninstall ${plugin} --save-dev`);

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
                        await executeShellCommand(`npm uninstall ${plugin} --save-dev`);

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
            },
            "plugin configure": async (ctx, input) => {
                const plugin = input.args.plugin;
                return actions[`${plugin} configure`]({args: {}, options: {}});
            }
        }
    }
}

export default init;