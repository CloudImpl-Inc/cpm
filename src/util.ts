import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {ActionInput, ActionOutput, CommandDef, CPMContext, CPMPlugin, Workflow} from "./index";
import {Command} from "commander";
import {execSync} from "child_process";
import yaml from "js-yaml";
import * as os from "os";
import * as fs from "fs";

export const cwd = process.cwd();
export const configFilePath = `${cwd}/cpm.yml`;
export const folderPath = `${cwd}/.cpm`;
export const variablesFilePath = `${folderPath}/variables.json`;
export const secretsFilePath = `${folderPath}/secrets.json`;
export const isProjectRepo = existsSync(configFilePath);
export const pluginRoot = `${cwd}/node_modules`;

export const globalFolderPath = `${os.homedir()}/.cpm`;
export const globalConfigFilePath = `${globalFolderPath}/cpm.yml`;
export const globalVariablesFilePath = `${globalFolderPath}/variables.json`;
export const globalSecretsFilePath = `${globalFolderPath}/secrets.json`;
export const globalPluginRoot = `${globalFolderPath}/node_modules`;

export const defaultProjectsRootPath = `${os.homedir()}/CPMProjects`;

export const stepOutput = isProjectRepo
    ? `${cwd}/.cpm/output.txt`
    : `${globalFolderPath}/output.txt`

export const createFolder = (path: string): void => {
    if (!existsSync(path)){
        mkdirSync(path);
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
    if (key.length == 1) {
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

export const executeCommand = async (action: CommandAction, input: ActionInput, outputKeys: string[]) => {
    // ensure output file is empty
    fs.writeFileSync(stepOutput, '');

    if (action !== undefined) {
        const result = await action(input);
        const filteredResult: ActionOutput = {};
        outputKeys.forEach(k => filteredResult[k] = result[k]);

        const stream = fs.createWriteStream(stepOutput);

        for (const [key, value] of Object.entries(filteredResult)) {
            stream.write(`${key}=${value}\n`);
        }

        stream.end();
        process.exit(0);
    } else {
        throw Error('command implementation not found');
    }
}

export const parseString = (str: string, params: any): string => {
    let updatedStr = str;
    let start = updatedStr.indexOf('{{', 0);

    while (start !== -1) {
        const end = updatedStr.indexOf('}}', start);
        const placeHolder = updatedStr.substring(start, end + 2);
        updatedStr = fillPlaceHolder(updatedStr, placeHolder, params);
        start = updatedStr.indexOf('{{', 0);
    }

    return updatedStr;
}

export const fillPlaceHolder = (cmd: string, placeHolder: string, params: any): string => {
    const key = placeHolder
        .replace('{{', '')
        .replace('}}', '')
        .split('.');

    const param = getMapKey(params, key);
    return cmd.replace(placeHolder, param);
}

export const executeShellCommand = async (command: string) => {
    console.log(command);
    const output = execSync(command, {env: {...process.env}});
    console.log(output.toString());

    const data: Record<string, string> = {};
    const lines = fs.readFileSync(stepOutput, 'utf-8').split('\n');
    for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
            data[key.trim()] = value.trim();
        }
    }

    return data;
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
        def.options[arg] = {}
    });

    return def;
}

export const runWorkflow = async (workflow: Workflow, input: ActionInput) => {
    const params: any = {
        inputs: input.options
    }

    for (const s of workflow.steps) {
        const shellCmd = parseString(s.run, params);
        const output = await executeShellCommand(shellCmd);
        addMapKey(params, [s.id, 'outputs'], output);
    }

    // Enable nested workflow
    const result: Record<string, string> = {};
    Object.entries(workflow.outputs || []).forEach(([key, value]) => {
        result[key] = parseString(value, params);
    })

    return result;
}

export type CommandAction = (input: ActionInput) => ActionOutput | Promise<ActionOutput>;