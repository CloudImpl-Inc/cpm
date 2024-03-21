import {addMapKey, executeShellCommand, parseShellCommand, readJson, stepOutput, WorkflowInit, writeJson} from "./util";
import {Command} from "commander";

const init: WorkflowInit = (ctx, name, workflow) => {
    const command = new Command(name);
    workflow.inputs.forEach(arg => command.option(`--${arg} <${arg}>`));

    command
        .action(async options => {
            const params: any = {
                inputs: options
            }

            for (const s of workflow.steps) {
                writeJson(stepOutput, {});
                const shellCmd = parseShellCommand(s.run, params);
                await executeShellCommand(shellCmd);
                addMapKey(params, [s.id, 'outputs'], readJson(stepOutput, {}));
            }

            // Enable nested workflow
            const result: Record<string, string> = {};
            Object.keys(workflow.outputs || []).forEach(k => {
                result[k] = parseShellCommand(workflow.outputs[k], params);
            })

            const stepOutputFinal = process.env.OUTPUT;
            if (stepOutputFinal && stepOutputFinal !== '') {
                writeJson(stepOutputFinal, result);
            }
        });

    return command;
}

export default init;