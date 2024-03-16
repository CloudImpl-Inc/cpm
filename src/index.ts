import cosmiconfig from "cosmiconfig";
import {Command} from "commander";

export interface CPMPlugin {
    name(): string;
    commands(): Command[]
}

// @ts-ignore
export const config: {plugins: string[]} = cosmiconfig('cpm');