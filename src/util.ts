import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {ActionInput, ActionOutput, CommandDef, CPMConfig, CPMKeyValueStore, Workflow} from "./index";
import {Command} from "commander";
import {spawn} from "child_process";
import yaml from "js-yaml";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as crypto from 'crypto';
import chalk from "chalk";

export const cwd = findCwd(process.cwd()) || process.cwd();

if (cwd !== process.cwd()) {
    process.chdir(cwd);
    console.log(`changed cpm working directory to ${cwd}`);
}

export const folderPath = `${cwd}/.cpm`;
export const configFilePath = `${cwd}/cpm.yml`;
export const packageJsonFile = `${folderPath}/package.json`;
export const variablesFilePath = `${folderPath}/variables.json`;
export const secretsFilePath = `${folderPath}/secrets.json`;
export const pluginRoot = `${folderPath}/node_modules`;
export const gitIgnoreFilePath = `${cwd}/.gitignore`;
export const hashFilePath = `${folderPath}/state.hash`;

export const isProjectRepo = existsSync(configFilePath);

export const globalFolderPath = `${os.homedir()}/.cpm`;
export const globalConfigFilePath = `${globalFolderPath}/cpm.yml`;
export const globalPackageJsonFile = `${globalFolderPath}/package.json`;
export const globalVariablesFilePath = `${globalFolderPath}/variables.json`;
export const globalSecretsFilePath = `${globalFolderPath}/secrets.json`;
export const globalPluginRoot = `${globalFolderPath}/node_modules`;

export const defaultProjectsRootPath = `${os.homedir()}/CPMProjects`;

export const stepOutput = isProjectRepo
    ? `${folderPath}/output.txt`
    : `${globalFolderPath}/output.txt`

export const stepEnvironment = isProjectRepo
    ? `${folderPath}/environment.txt`
    : `${globalFolderPath}/environment.txt`

function findCwd(startDir: string): string | null {
    let currentDir = startDir;

    // Traverse upwards until reaching the root directory
    while (true) {
        const cpmYmlPath = path.join(currentDir, 'cpm.yml');

        // Check if cpm.yml file exists in the current directory
        if (fs.existsSync(cpmYmlPath) && fs.statSync(cpmYmlPath).isFile()) {
            // Found cpm.yml file, return the directory containing it
            return currentDir;
        }

        // Move up one directory
        const parentDir = path.dirname(currentDir);

        // If current directory is the same as the parent directory, we've reached the root
        if (currentDir === parentDir) {
            break;
        }

        currentDir = parentDir;
    }

    // cpm.yml not found in any parent directory
    return null;
}

export const createFolder = (path: string): void => {
    if (!existsSync(path)) {
        mkdirSync(path);
    }
}

export const createFile = (path: string, def: string | (() => string)) => {
    if (!existsSync(path)) {
        const data = (typeof def === 'function') ? def() : def;
        writeFileSync(path, Buffer.from(data))
    }
}

export const readJson = (path: string, def: any | (() => any)): any => {
    if (existsSync(path)) {
        const data = readFileSync(path);
        return JSON.parse(data.toString());
    } else {
        if (typeof def === 'function') {
            return def();
        } else {
            return def;
        }
    }
}

export const readYaml = (path: string, def: any | (() => any)): any => {
    if (existsSync(path)) {
        const data = readFileSync(path);
        return yaml.load(data.toString());
    } else {
        if (typeof def === 'function') {
            return def();
        } else {
            return def;
        }
    }
}

export const writeJson = (path: string, obj: any): void => {
    const json = JSON.stringify(obj, null, 4);
    writeFileSync(path, Buffer.from(json))
}

export const writeYaml = (path: string, obj: any): void => {
    const yml = yaml.dump(obj);
    writeFileSync(path, Buffer.from(yml))
}

export const computeIfNotExist = (map: any, key: string, value: any | ((k: string) => any)): any => {
    if (!map[key]) {
        if (typeof value === 'function') {
            map[key] = value(key);
        } else {
            map[key] = value;
        }
    }

    return map[key];
}

export const getMapKey = (map: any, key: string[]): any => {
    if (!map) {
        return undefined;
    } else if (key.length == 1) {
        return map[key[0]];
    } else {
        const m = map[key[0]];
        key.shift();
        return getMapKey(m, key);
    }
}

export const addMapKey = (map: any, key: string[], value: any): void => {
    if (key.length == 1) {
        map[key[0]] = value;
    } else {
        const m = computeIfNotExist(map, key[0], {});
        key.shift();
        addMapKey(m, key, value);
    }
}

export const removeMapKey = (map: any, key: string[]): void => {
    if (key.length == 1) {
        delete map[key[0]];
    } else if (map) {
        const m = map[key[0]];
        key.shift();
        removeMapKey(m, key);
    }
}

export const executeCommand = async (action: CommandAction, input: ActionInput, outputKeys: string[]) => {
    if (action !== undefined) {
        const result = await action(input);
        const filteredResult: ActionOutput = {};
        outputKeys.forEach(k => filteredResult[k] = result[k]);

        let outputKeyVal = '';
        for (const [key, value] of Object.entries(filteredResult)) {
            outputKeyVal += `${key}=${value}\n`;
        }

        fs.appendFileSync(stepOutput, outputKeyVal);
        process.exit(0);
    } else {
        throw Error('command implementation not found');
    }
}

type WorkflowContext = {
    inputs: Record<string, any>,
    steps: Record<string, Record<string, any>>,
    environment: Record<string, string | undefined>
}

export const parseString = (str: string, context: WorkflowContext): string => {
    let updatedStr = str;
    let start = updatedStr.indexOf('${{', 0);

    while (start !== -1) {
        const end = updatedStr.indexOf('}}', start);

        const placeHolder = updatedStr.substring(start, end + 2);
        const expression = placeHolder
            .replace('${{', '')
            .replace('}}', '')
        const value = evaluateExpression(expression, context);
        updatedStr = updatedStr.replace(placeHolder, value);

        start = updatedStr.indexOf('${{', 0);
    }

    return updatedStr;
}

export const evaluateExpression = (expression: string, context: WorkflowContext): string => {
    const expressionTrimmed = expression.trim();
    const {
        inputs,
        steps,
        environment
    } = context;
    return eval(expressionTrimmed);
}

export const readKeyValueTxt = (file: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const lines = readFileSync(file, 'utf-8').split('\n');
    for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
            result[key.trim()] = value.trim();
        }
    }
    return result;
}

export const executeShellCommand = async (command: string, options?: {
    cwd?: string,
    environment?: Record<string, string | undefined>
}) => {
    console.log(command);

    const newCwd = options?.cwd || process.cwd();
    const newEnv = options?.environment || process.env;

    // Make sure output and environment file empty before executing command
    writeFileSync(stepOutput, Buffer.from(''));
    writeFileSync(stepEnvironment, Buffer.from(''));

    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, [], {
            stdio: 'inherit',
            shell: true,
            cwd: newCwd,
            env: {
                ...newEnv,
                CPM_OUTPUT: stepOutput,
                CPM_ENVIRONMENT: stepEnvironment,
                CPM_PARENT_PROCESS: process.pid.toString()
            }
        });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command '${command}' exited with code ${code}`));
            }
        });
    });

    const result = readKeyValueTxt(stepOutput);
    const environment = readKeyValueTxt(stepEnvironment);

    return {
        result,
        environment
    };
}

export type TreeNode<T> = {
    current: T | null;
    children: Record<string, TreeNode<T>>;
};


export const convertFlatToTree = <T>(flatObject: Record<string, T>): TreeNode<T> => {
    const tree: TreeNode<T> = {
        current: null,
        children: {}
    };

    for (const key in flatObject) {
        const segments = key.split(' ');
        let currentNode = tree;

        for (const segment of segments) {
            currentNode.children[segment] = currentNode.children[segment] || {
                current: null,
                children: {}
            };
            currentNode = currentNode.children[segment];
        }

        currentNode.current = flatObject[key];
    }

    return tree;
}

export const parseCommand = (command: Command, def: CommandDef, action: CommandAction) => {
    const argDefs = def.arguments || {};
    const argNames = Object.keys(argDefs);

    const optDefs = def.options || {};
    const optNames = Object.keys(optDefs);

    const outputs = def.outputs || {};
    const outputNames = Object.keys(outputs);

    for (const name of Object.keys(argDefs)) {
        const def = argDefs[name];
        command.argument(`<${name}>`, def.description);
    }

    for (const name of Object.keys(optDefs)) {
        const def = optDefs[name];
        let optionStr = `-${def.shortName}, --${name}`;

        if (def.valueRequired) {
            optionStr += ` <${name}>`;
        }

        command.option(optionStr, def.description);
    }

    command.action(async (...args) => {
        const actionArgs: any = {};
        if (argNames.length > 0) {
            for (let i = 0; i < argNames.length; i++) {
                actionArgs[argNames[i]] = args[i];
            }
        }

        const actionOpts: any = (optNames.length > 0)
            ? args[argNames.length]
            : {};

        await executeCommand(action, {args: actionArgs, options: actionOpts}, outputNames);
    });
}

export const createWorkflowCommand = (workflow: Workflow) => {
    const def: CommandDef = {
        description: workflow.description,
        options: {}
    }

    workflow.inputs?.forEach(arg => {
        // @ts-ignore
        def.options[arg] = {
            valueRequired: true
        }
    });

    return def;
}

export const runWorkflow = async (workflow: Workflow, input: ActionInput) => {
    const context: WorkflowContext = {
        inputs: input.options,
        steps: {},
        environment: {...process.env},
    }

    for (const s of workflow.steps) {
        const shellCmd = parseString(s.run, context);
        const {result, environment} = await executeShellCommand(shellCmd, {
            cwd: cwd,
            environment: context.environment
        });
        addMapKey(context.steps, [s.id, 'outputs'], result);
        context.environment = {...context.environment, ...environment};
    }

    // Enable nested workflow
    const result: Record<string, string> = {};
    Object.entries(workflow.outputs || []).forEach(([key, value]) => {
        result[key] = parseString(value, context);
    })

    return result;
}

export const syncProject = async (config: CPMConfig) => {
    if (isProjectRepo) {
        await executeShellCommand('npm install', {cwd: folderPath});

        if (config.flow?.enabled) {
            await executeShellCommand('cpm flow setup');
        }
    } else {
        console.log(chalk.red('please run this command inside a cpm project'));
    }
}

export const calculateFileMD5Sync = (filePath: string): string => {
    try {
        const fileData = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(fileData);
        return hash.digest('hex');
    } catch (error) {
        throw new Error(`Error calculating MD5 hash: ${error}`);
    }
};

export const autoSync = async (config: CPMConfig) => {
    // If cpm command executed inside auto sync then it will trigger infinite loop
    // Run auto sync only for parent cpm process

    const parentProcess = process.env.CPM_PARENT_PROCESS;
    if (parentProcess) {
        return;
    }

    if (isProjectRepo) {
        const fileHash = calculateFileMD5Sync(configFilePath).trim();
        const savedHash = (existsSync(hashFilePath))
            ? readFileSync(hashFilePath).toString().trim()
            : '';

        if (fileHash !== savedHash) {
            await syncProject(config);
            writeFileSync(hashFilePath, Buffer.from(fileHash));
            console.log(chalk.green('cpm project synced automatically'))
        }
    }
}

export class FileBasedKeyValueStore implements CPMKeyValueStore{

    constructor(private file: string, private namespace: string) {
    }

    get(key: string): string {
        const map = readJson(this.file, {});
        return getMapKey(map, [...this.namespace.split('.'), ...key.split('.')])
    };

    set(key: string, value: any): void {
        const map = readJson(this.file, {});
        addMapKey(map, [...this.namespace.split('.'), ...key.split('.')], value);
        writeJson(this.file, map);
    };

    remove(key: string): void {
        const map = readJson(this.file, {});
        removeMapKey(map, [...this.namespace.split('.'), ...key.split('.')]);
        writeJson(this.file, map);
    }
}

export type CommandAction = (input: ActionInput) => ActionOutput | Promise<ActionOutput>;