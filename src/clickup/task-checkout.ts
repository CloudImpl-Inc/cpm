import {OptionValues} from "commander";

export default function (args: Record<string, string>, options: OptionValues) {
    console.log(`checkout task ${args.id} inside external js file`);
}