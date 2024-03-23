// language=javascript
const script = `
    import * as fs from "fs";

    // Function to read the current branch name
    function getCurrentBranchName() {
        return require('child_process').execSync('git symbolic-ref --short HEAD', {encoding: 'utf-8'}).trim();
    }

    // Function to check if the branch name matches the specified pattern
    function isFeatureBranch(branchName) {
        const pattern = /^feature\\/TASK-[A-Za-z0-9]+-\\S+/;
        return pattern.test(branchName);
    }

    // Function to extract the issue ID from the branch name
    function extractIssueID(branchName) {
        const match = branchName.match(/TASK-[A-Za-z0-9]+/);
        if (match) {
            return match[0];
        }
        return '';
    }

    // Function to prepend the commit message with the issue ID
    function prependIssueID(commitMsgFile, issueID) {
        const commitMsg = fs.readFileSync(commitMsgFile, 'utf-8');
        if (!commitMsg.includes(issueID)) {
            const updatedMsg = \`[\${issueID}] \${commitMsg}\`;
            fs.writeFileSync(commitMsgFile, updatedMsg);
        } else {
            console.log('prepare-commit-msg: Oh great, you already included issue number. Nice job ;)');
        }
    }

    // Main function
    function main() {
        const branchName = getCurrentBranchName();

        if (isFeatureBranch(branchName)) {
            console.log('prepare-commit-msg: Oh yeah, it\\'s a feature branch. Happy coding ;)');

            const issueID = extractIssueID(branchName);
            if (issueID !== '') {
                const commitMsgFile = process.argv[2];
                prependIssueID(commitMsgFile, issueID);
            }
        } else {
            console.log('prepare-commit-msg: Oops, not on a feature branch. I mean who would want that right ;)');
        }
    }

    // Run main function
    main();
`

export default '#!/usr/bin/env node\n\n' + script;