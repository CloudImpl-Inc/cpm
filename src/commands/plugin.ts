import {
    CommandInit,
    computeIfNotExist, configFilePath,
    executeShellCommand,
    globalConfigFilePath,
    globalFolderPath, isProjectRepo,
    readYaml, writeYaml
} from "../util";
import {Command, OptionValues} from "commander";

const init: CommandInit = (ctx, actions) => {
    const plugin = new Command('plugin');

    plugin
        .command('add')
        .argument('<plugin>')
        .description('add cpm plugin')
        .option('-g, --global', 'add global cpm plugin')
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
        });

    plugin.command('remove')
        .argument('<plugin>')
        .description('remove cpm plugin')
        .option('-g, --global', 'remove global cpm plugin')
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
        });

    return [plugin];
}

export default {
    name: 'plugin',
    init: init,
};