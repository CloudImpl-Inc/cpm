import {Command} from "commander";
import {readFileSync} from "fs";

export interface CPMPlugin {
    commands(): Command[]
}

export interface CPMPluginContext {
    config: Record<string, any>
    secrets: Record<string, string>
}

export type CPMPluginCreator = (ctx: CPMPluginContext) => CPMPlugin | Promise<CPMPlugin>;

const data = readFileSync(`${process.cwd()}/cpm.json`);

export const config: {plugins: string[]} = Object.freeze(JSON.parse(data.toString()));