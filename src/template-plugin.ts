import {Action, CPMPluginCreator} from "./index";
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import {cwd} from "./util";
import chalk from "chalk";

const replaceValueInFile = async (filePath: string, inputValues: Record<string, string>) => {
    let fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // Regular expression to match the pattern ${{ cpm.<input-name> }}
    const pattern = /\$\{\{\s*cpm\.([^\s\}]+)\s*\}\}/g;

    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
        const inputName = match[1];
        if (!(inputName in inputValues)) {
            inputValues[inputName] = await promptInput(inputName);
        }
        const regex = new RegExp(`\\$\\{\\{\\s*cpm\\.${inputName}\\s*\\}\\}`, 'g');
        fileContent = fileContent.replace(regex, inputValues[inputName]);
    }

    // Write the modified content back to the file
    await fs.promises.writeFile(filePath, fileContent);
}

const replaceValuesInFiles = async (directoryPath: string, inputValues: Record<string, string>) => {
    const files = await fs.promises.readdir(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStats = await fs.promises.stat(filePath);

        if (fileStats.isFile()) {
            await replaceValueInFile(filePath, inputValues); // Call for file
        } else if (fileStats.isDirectory()) {
            if (file !== '.git') {
                await replaceValuesInFiles(filePath, inputValues); // Recursive call for directories
            }
        }
    }
};

const promptInput = async (inputName: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`Enter value for ${inputName}: `, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

const fill: Action = async (ctx, input) => {
    const {file} = input.options;

    if (file) {
        await replaceValueInFile(file, {});
    } else {
        await replaceValuesInFiles(cwd, {});
    }

    console.log(chalk.green('replacement completed'));
    return {};
};

const init: CPMPluginCreator = ctx => {
    return {
        name: "template",
        actions: {
            "template fill": fill
        }
    }
}

export default init;