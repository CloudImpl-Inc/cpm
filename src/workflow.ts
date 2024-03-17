import {executeShellCommand, parseShellCommand, readJson, stepOutput, WorkflowInit, writeJson} from "./util";
import {Command} from "commander";

const init: WorkflowInit = (name, workflow) => {
    const command = new Command(name);
    workflow.args.forEach(arg => command.option(`--${arg} <${arg}>`));

    command
        .action(async options => {
            const params: any = {
                input: options
            }

            workflow.steps.forEach(s => {
                writeJson(stepOutput, {});
                const shellCmd = parseShellCommand(s.run, params);
                executeShellCommand(shellCmd);
                params[s.id] = readJson(stepOutput, {});
            })
        });

    return command;
}

export default init;