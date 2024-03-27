import fs, {existsSync} from "fs";
import path from "path";
import {Action, CPMContext, CPMPlugin} from "../index";
import {computeIfNotExist, configFilePath, cwd, executeShellCommand, isProjectRepo, readYaml, writeYaml} from "../util";
import prepareCommitMsg from "../git-hooks/prepare-commit-msg";
import chalk from 'chalk';
import inquirer from "inquirer";
import prompt = inquirer.prompt;

const taskStatus = {
    OPEN: 'Open',
    PENDING: 'pending',
    IN_PROGRESS: 'in progress',
    COMPLETED: 'completed',
    IN_REVIEW: 'in review',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
    CLOSED: 'Closed'
}

const flowEnable: Action = async (ctx, input) => {
    if (!isProjectRepo) {
        console.log(chalk.red('not a project folder'));
        return {};
    }

    if (ctx.config.flow?.enabled) {
        console.log(chalk.yellow('cpm flow already enabled'));
        return {};
    }

    const config: { flow: any } = readYaml(configFilePath, {});
    computeIfNotExist(config, 'flow', {});
    config.flow.enabled = true;
    writeYaml(configFilePath, config);
    console.log(chalk.green('cpm flow enabled'));

    await executeShellCommand('cpm flow setup');
    await executeShellCommand('cpm flow configure');

    return {};
};

const flowConfigure: Action = async (ctx, input) => {
    if (!ctx.config.flow?.enabled) {
        console.log(chalk.yellow('cpm flow not enabled, please run cpm flow enable'));
        return {};
    }

    const answers: {
        defaultBranch: string,
        productionBranch: string
    } = await prompt([
        {
            type: 'input',
            name: 'defaultBranch',
            message: 'Enter default branch name:'
        },
        {
            type: 'input',
            name: 'productionBranch',
            message: 'Enter production branch name'
        }
    ]);

    const config: { flow: any } = readYaml(configFilePath, {});
    config.flow.defaultBranch = answers.defaultBranch;
    config.flow.productionBranch = answers.productionBranch;
    writeYaml(configFilePath, config);
    console.log(chalk.green('cpm flow configured'));

    return {};
}

const flowSetup: Action = async (ctx, input) => {
    if (!ctx.config.flow?.enabled) {
        console.log(chalk.yellow('cpm flow not enabled, please run cpm flow enable'));
        return {};
    }

    if (existsSync(path.join(cwd, '.git', 'hooks'))) {
        fs.writeFileSync(path.join(cwd, '.git', 'hooks', 'prepare-commit-msg'), prepareCommitMsg)
        await executeShellCommand(`chmod +x ${cwd}/.git/hooks/*`)
    }

    return {};
}

const flowCheckout: Action = async (ctx, input) => {
    if (!ctx.config.flow?.enabled) {
        console.log(chalk.yellow('cpm flow not enabled, please run cpm flow enable'));
        return {};
    }

    if (!ctx.config.flow?.defaultBranch || !ctx.config.flow?.productionBranch) {
        console.log(chalk.yellow('cpm flow not configured, please run cpm flow configure'));
        return {};
    }

    let taskId;
    if (input.options.taskId) {
        taskId = input.options.taskId;
    } else {
        const {result: task} = await executeShellCommand('cpm task select -a');
        taskId = task.id;
    }

    const defaultBranch = ctx.config.flow.defaultBranch;
    const {result: {currentBranch, changesPending}} = await executeShellCommand('cpm repo info');

    const {result: task} = await executeShellCommand(`cpm task get ${taskId}`);
    const parts = task.title.split(' ');
    const titleTrimmed = parts.slice(0, Math.min(parts.length, 4)).join('-');
    const branchName = `feature/TASK-${task.id}-${titleTrimmed}`;

    if (currentBranch === branchName) {
        console.log(chalk.green('Already on task branch'));
        return {};
    }

    if (task.status === taskStatus.OPEN) {
        console.log(chalk.yellow('Please assign task and change status to pending'));
        return {};
    }

    if (task.status === taskStatus.BLOCKED) {
        console.log(chalk.yellow('Task is blocked please unblock it first'));
        return {};
    }

    if (task.status === taskStatus.ACCEPTED || task.status === taskStatus.CLOSED) {
        console.log(chalk.yellow('Task already completed'));
        return {};
    }

    if (changesPending === 'true') {
        console.log(chalk.red('Branch has pending changes, please commit them'));
        return {};
    }

    if (task.status === taskStatus.PENDING) {
        await executeShellCommand(`cpm repo checkout --branch ${defaultBranch} && cpm repo sync`);
        await executeShellCommand(`cpm repo checkout --branch ${branchName}`);
        await executeShellCommand(`cpm task status ${taskId} '${taskStatus.IN_PROGRESS}'`);
    } else if (task.status === taskStatus.IN_PROGRESS || taskStatus.IN_REVIEW) {
        await executeShellCommand(`cpm repo checkout --branch ${branchName} && cpm repo sync`);
    } else if (task.status === taskStatus.REJECTED) {
        await executeShellCommand(`cpm repo checkout --branch ${defaultBranch} && cpm repo sync`);
        await executeShellCommand(`cpm task status ${taskId} '${taskStatus.IN_PROGRESS}'`);
    }

    return {};
}

const flowSubmit: Action = async (ctx, input) => {
    if (!ctx.config.flow?.enabled) {
        console.log(chalk.yellow('cpm flow not enabled, please run cpm flow enable'));
        return {};
    }

    if (!ctx.config.flow?.defaultBranch || !ctx.config.flow?.productionBranch) {
        console.log(chalk.yellow('cpm flow not configured, please run cpm flow configure'));
        return {};
    }

    const defaultBranch = ctx.config.flow.defaultBranch;
    const {result: {currentBranch, changesPending}} = await executeShellCommand('cpm repo info');

    if (!currentBranch.startsWith('feature/TASK')) {
        console.log(chalk.red('Not a feature branch'));
        return {};
    }

    if (changesPending === 'true') {
        console.log(chalk.red('Branch has pending changes, please commit them'));
        return {};
    }

    const taskId = currentBranch.split('/')[1].split('-')[1];
    const {result: task} = await executeShellCommand(`cpm task get ${taskId}`);

    if (task.status === taskStatus.IN_PROGRESS) {
        await executeShellCommand(`cpm repo sync`);
        await executeShellCommand(`cpm pr create ${currentBranch} ${defaultBranch}`);
        await executeShellCommand(`cpm task status ${taskId} '${taskStatus.IN_REVIEW}'`)
    } else if (task.status === taskStatus.IN_REVIEW) {
        await executeShellCommand(`cpm repo sync`);
        await executeShellCommand(`cpm pr create ${currentBranch} ${defaultBranch}`);
    }

    return {};
}

const flowPlugin: CPMPlugin = {
    name: 'flow',
    actions: {
        'flow enable': flowEnable,
        'flow configure': flowConfigure,
        'flow setup': flowSetup,
        'flow checkout': flowCheckout,
        'flow submit': flowSubmit
    }
};

export default function createFlowPlugin(ctx: CPMContext): CPMPlugin {
    return flowPlugin;
}