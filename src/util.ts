import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {ActionInput, ActionOutput, Workflow} from "./index";
import {Command} from "commander";
import {execSync} from "child_process";

export const cwd = process.cwd();

export const stepOutput = `${cwd}/.cpm/output.json`;

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

export const writeJson = (path: string, obj: any): void => {
    const json = JSON.stringify(obj, null, 4);
    writeFileSync(path, Buffer.from(json))
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
    // ToDo: Implement shell command parse, Replace placeholders with actual value from params
    console.log(`cmd: ${cmd}, params: ${JSON.stringify(params)}`);
    return cmd;
}

export const executeShellCommand = (cmd: string) => {
    console.log(`exec: ${cmd}`);
    execSync(cmd, {env: {OUTPUT: stepOutput}});
}

export type CommandAction = (input: ActionInput) => ActionOutput | Promise<ActionOutput>;

export type CommandInit = (actions: Record<string, any>) => Command[] | Promise<Command[]>;

export type WorkflowInit = (name: string, workflow: Workflow) => Command | Promise<Command>;