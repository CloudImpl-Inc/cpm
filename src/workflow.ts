import {WorkflowInit} from "./util";
import {Command} from "commander";

const init: WorkflowInit = (name, workflow) => {
    const command = new Command(name);
    workflow.args.forEach(arg => command.option(`--${arg} <${arg}>`));

    command
        .action(async options => {
            console.log(`args = ${JSON.stringify(options)}\n`);

            workflow.steps.forEach(s => {
                console.log(`exec: ${s.run}`);
            })
        });

    return command;
}

export default init;