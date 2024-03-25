## Workflows
Workflows allow you to define sequences of steps to automate tasks. Here's an example of defining a workflow:

```yaml
workflows:
  - name: test-workflow
    description: test workflow for cpm
    inputs:
      - taskId
    steps:
      - id: get_task
        run: cpm task get ${{ inputs.taskId }}
      - id: repo_checkout
        run: cpm repo checkout --branch ${{ steps.get_task.outputs.id }}
    outputs:
      branchName: ${{ steps.get_task.outputs.id }}
```

In this example:

- The workflow is named "test-workflow" with a description indicating it's an example for cpm.
- It takes an input variable taskId.
- The first step (get_task) executes the cpm task get command with the provided taskId.
- The second step (repo_checkout) executes the cpm repo checkout command, checking out to a branch named after the ID obtained from the previous step.
- The workflow outputs the branch name, which is the same as the ID obtained from the get_task step.

To execute this workflow
```bash
cpm exec test-workflow --taskId <actual-task-id>
```