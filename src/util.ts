import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {ActionInput, ActionOutput, CPMContext, Workflow} from "./index";
import {Command} from "commander";
import {execSync} from "child_process";
import yaml from "js-yaml";
import * as os from "os";

export const cwd = process.cwd();
export const configFilePath = `${cwd}/cpm.yml`;
export const folderPath = `${cwd}/.cpm`;
export const secretsFilePath = `${folderPath}/secrets.json`;
export const isProjectRepo = existsSync(configFilePath);

export const globalFolderPath = `${os.homedir()}/.cpm`;
export const globalConfigFilePath = `${globalFolderPath}/cpm.yml`;
export const globalSecretsFilePath = `${globalFolderPath}/secrets.json`;

export const stepOutput = isProjectRepo
    ? `${cwd}/.cpm/output.json`
    : `${globalFolderPath}/output.json`

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
    if (action !== undefined) {
        const result = await action(input);
        const filteredResult: ActionOutput = {};
        outputKeys.forEach(k => filteredResult[k] = result[k]);

        const stepOutput = process.env.OUTPUT;
        if (stepOutput && stepOutput !== '') {
            writeJson(stepOutput, filteredResult);
        }
    } else {
        throw Error('command implementation not found');
    }
}

export const parseShellCommand = (cmd: string, params: any): string => {
    let updatedCmd = cmd;
    let start = updatedCmd.indexOf('{{', 0);

    while (start !== -1) {
        const end = updatedCmd.indexOf('}}', start);
        const placeHolder = updatedCmd.substring(start, end + 2);
        updatedCmd = fillPlaceHolder(updatedCmd, placeHolder, params);
        start = updatedCmd.indexOf('{{', 0);
    }

    return updatedCmd;
}

export const fillPlaceHolder = (cmd: string, placeHolder: string, params: any): string => {
    const key = placeHolder
        .replace('{{', '')
        .replace('}}', '')
        .split('.');

    const param = getMapKey(params, key);
    return cmd.replace(placeHolder, param);
}

export const executeShellCommand = (cmd: string) => {
    console.log(cmd);
    const buffer = execSync(cmd, {env: {...process.env, OUTPUT: stepOutput}});
    console.log(buffer.toString());
}

export type CommandAction = (input: ActionInput) => ActionOutput | Promise<ActionOutput>;

export type CommandInit = (ctx: CPMContext, actions: Record<string, any>) => Command[] | Promise<Command[]>;

export type WorkflowInit = (ctx: CPMContext, name: string, workflow: Workflow) => Command | Promise<Command>;