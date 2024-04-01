import {Action, ActionOutput, CPMConfig, CPMContext, CPMPlugin} from "../index";
import {
    configFilePath,
    createFile,
    createFolder, executeShellCommand,
    folderPath, getSelection,
    gitIgnoreFilePath,
    isProjectRepo, syncProject,
    writeJson,
    writeYaml
} from "../util";
import chalk from "chalk";
import {appendFileSync, readdirSync} from "fs";
import path from "path";
import fs from "fs";

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
            '\n# cpm\n' +
            '.cpm/node_modules\n' +
            '.cpm/_*\n',
        )

        console.log(chalk.green('cpm project initialized'));
    }
    return {};
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

const clone: Action = async (ctx, input): Promise<ActionOutput> => {
    const {url} = input.args;

    if (!url.startsWith('http')) {
        console.log(chalk.red('Only support http/https urls'));
        return {};
    }

    const [org, repo] = url.split('/').slice(-2).map((segment: string) => segment.replace('.git', ''));
    const repoDir = path.join(ctx.config.rootDir, org, repo);

    // Check if the repository is already cloned
    if (fs.existsSync(repoDir)) {
        console.log(chalk.yellow(`Repository already exists at ${repoDir}. Skipping clone step.`));
        return {org, repo, path: repoDir};
    }

    await executeShellCommand(`cpm repo clone ${url} ${repoDir}`);
    return {org, repo, path: repoDir};
}

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

const sync: Action = async (ctx, input) => {
    await syncProject(ctx.config);
    await executeShellCommand('cpm repo sync');
    return {};
};

const projectPlugin: CPMPlugin = {
    name: 'project',
    actions: {
        'project init': init,
        'project list': list,
        'project clone': clone,
        'project goto': goTo,
        'project sync': sync
    }
};

export default function createProjectPlugin(ctx: CPMContext): CPMPlugin {
    return projectPlugin;
}