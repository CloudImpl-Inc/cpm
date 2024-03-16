import {Command} from "commander";
import {readFileSync} from "fs";

export interface CPMPlugin {
    name(): string;
    commands(): Command[]
}

const data = readFileSync(`${process.cwd()}/cpm.json`);
export const config: {plugins: string[]} = JSON.parse(data.toString());