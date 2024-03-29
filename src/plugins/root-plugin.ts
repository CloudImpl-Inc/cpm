import {Action, CPMConfig, CPMPluginCreator} from "../index";
import {appendFileSync, readdirSync} from "fs";
import {
    computeIfNotExist,
    configFilePath,
    createFile,
    createFolder,
    executeShellCommand,
    folderPath,
    gitIgnoreFilePath,
    globalConfigFilePath,
    globalFolderPath,
    isProjectRepo,
    readJson,
    readYaml,
    secretsFilePath,
    syncProject,
    variablesFilePath,
    writeJson,
    writeYaml,
    getSelection
} from "../util";
import chalk from 'chalk';

const init: Action = async (ctx, input) => {
    if (isProjectRepo) {
        console.log(chalk.yellow('already initialized'));
    } else {
        const config: CPMConfig = {
            plugins: []
        }
        writeYaml(configFilePath, config);

        createFolder(folderPath);
        writeJson(`${folderPath}/package.json`, {});

        createFile(gitIgnoreFilePath, '');
        appendFileSync(gitIgnoreFilePath,
            '# cpm\n' +
            '.cpm/node_modules\n' +
            '.cpm/state.hash\n' +
            '.cpm/output.txt\n' +
            '.cpm/secrets.json\n',
        )

        console.log(chalk.green('cpm project initialized'));
    }
    return {};
};

const goTo: Action = async (ctx, input) => {
    const {query} = input.args;
    const filtered: {id: string, name: string, org: string, repo: string, path: string}[] = [];

    for (const orgDir of readdirSync(ctx.config.rootDir, {withFileTypes: true})) {
        if (!orgDir.isDirectory()) {
            continue;
        }

        const org = orgDir.name;

        for (const repoDir of readdirSync(`${orgDir.path}/${orgDir.name}`, {withFileTypes: true})) {
            const repo = repoDir.name;
            const repoNameFull = `${orgDir.name}/${repoDir.name}`;
            const path = `${repoDir.path}/${repoDir.name}`;

            if (orgDir.isDirectory() && repoNameFull.toLowerCase().includes(query.toLowerCase())) {
                filtered.push({id: path, name: `${org}/${repo}`, org, repo, path});
            }
        }
    }

    if (filtered.length === 0) {
        console.log(chalk.red('repository not found'));
        return {};
    } else if (filtered.length === 1) {
        const result = filtered[0];
        console.log(chalk.green(result.path));
        return result;
    } else {
        const selection = await getSelection('Select repository:', filtered);
        const result = filtered.find(f => f.id === selection)!;
        console.log(chalk.green(result.path));
        return result;
    }
};

const list: Action = (ctx, input) => {
    readdirSync(ctx.config.rootDir, {withFileTypes: true})
        .filter(orgDir => orgDir.isDirectory())
        .forEach(orgDir => {
            console.log(`|--${orgDir.name}`)
            readdirSync(`${orgDir.path}/${orgDir.name}`, {withFileTypes: true})
                .filter(repoDir => repoDir.isDirectory())
                .forEach(repoDir => console.log(`|  |--${repoDir.name} => ${repoDir.path}/${repoDir.name}`))
        })

    return {};
};

const sync: Action = async (ctx, input) => {
    await syncProject(ctx.config);
    return {};
};

const pluginList: Action = async (ctx, input) => {
    if (input.options.global) {
        await executeShellCommand('npm list --depth=0', {
            cwd: globalFolderPath
        });
    } else if (isProjectRepo) {
        await executeShellCommand('npm list --depth=0', {
            cwd: folderPath
        });
    } else {
        console.log(chalk.red('please run this command inside a cpm project'));
    }

    return {};
};

const pluginAdd: Action = async (ctx, input) => {
    const plugin = input.args.plugin;

    if (input.options.global) {
        const config = readYaml(globalConfigFilePath, {})
        const plugins = computeIfNotExist(config, 'plugins', []);

        await executeShellCommand(`npm install ${plugin} --save-dev`, {
            cwd: globalFolderPath
        });

        if (!plugins.includes(plugin)) {
            plugins.push(plugin);
            writeYaml(globalConfigFilePath, config);
            console.log(chalk.green('plugin added'));
        }
    } else if (isProjectRepo) {
        const config = readYaml(configFilePath, {})
        const plugins = computeIfNotExist(config, 'plugins', []);

        await executeShellCommand(`npm install ${plugin} --save-dev`, {
            cwd: folderPath
        });

        if (!plugins.includes(plugin)) {
            plugins.push(plugin);
            writeYaml(configFilePath, config);
            console.log(chalk.green('plugin added'));

            await executeShellCommand(`cpm plugin configure ${plugin}`)
        }
    } else {
        console.log(chalk.red('please run this command inside a cpm project'));
    }

    return {};
};

const pluginRemove: Action = async (ctx, input) => {
    const plugin = input.args.plugin;

    if (input.options.global) {
        const config = readYaml(globalConfigFilePath, {})
        const plugins = computeIfNotExist(config, 'plugins', []);

        await executeShellCommand(`npm uninstall ${plugin} --save-dev`, {
            cwd: globalFolderPath
        });

        if (plugins.includes(plugin)) {
            const index = plugins.indexOf(plugin);
            if (index > -1) {
                plugins.splice(index, 1);
            }
            writeYaml(globalConfigFilePath, config);
        }

        console.log(chalk.green('plugin removed'));
    } else if (isProjectRepo) {
        const config = readYaml(configFilePath, {})
        const plugins = computeIfNotExist(config, 'plugins', []);

        await executeShellCommand(`npm uninstall ${plugin} --save-dev`, {
            cwd: folderPath
        });

        if (plugins.includes(plugin)) {
            const index = plugins.indexOf(plugin);
            if (index > -1) {
                plugins.splice(index, 1);
            }
            writeYaml(configFilePath, config);
        }

        console.log(chalk.green('plugin removed'));
    } else {
        console.log(chalk.red('please run this command inside a cpm project'));
    }

    return {};
}

const pluginPurge: Action = async (ctx, input) => {
    await pluginRemove(ctx, input);

    const plugin = input.args.plugin;
    if (isProjectRepo) {
        const variables = readJson(variablesFilePath, {});
        delete variables[plugin];
        writeJson(variablesFilePath, variables);

        const secrets = readJson(secretsFilePath, {});
        delete secrets[plugin];
        writeJson(secretsFilePath, secrets);

        console.log(chalk.green('plugin purged'));
    }

    return {};
}

const pluginConfigure: Action = async (ctx, input) => {
    if (isProjectRepo) {
        const plugin = input.args.plugin;
        const result = await ctx.execute(`${plugin} configure`, {args: {}, options: {}});
        console.log('plugin configured');
        return result;
    } else {
        console.log(chalk.red('please run this command inside a cpm project'));
        return {};
    }
};

const pluginInit: CPMPluginCreator = ctx => {
    return {
        name: "root",
        actions: {
            "init": init,
            "goto": goTo,
            "list": list,
            "sync": sync,
            "plugin list": pluginList,
            "plugin add": pluginAdd,
            "plugin remove": pluginRemove,
            "plugin purge": pluginPurge,
            "plugin configure": pluginConfigure
        }
    }
}

export default pluginInit;