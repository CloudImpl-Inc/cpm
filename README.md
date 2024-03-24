# cpm - Cloudimpl project manager

cpm is a command-line tool for managing projects efficiently. It provides various commands to streamline project management tasks.

## Installation

To install cpm, run:

```bash
npm i -g @cloudimpl-inc/cpm
```

After installing cpm, you need to install the `cpm-git` plugin globally. To install the plugin, run:

```bash
cpm plugin add @cloudimpl-inc/cpm-git -g
```

## Usage

```bash
cpm <command> [options] [arguments]
```

## Available plugins
- [Official plugins](https://cloudimpl-inc.github.io/cpm-plugin-pack/)
- [Community plugins](https://github.com/topics/cpm-plugin-community)

## Getting Started

### Clone existing repository

To get started with the project, follow these steps:

#### Clone repository

- **Clone the repository:**
```bash
cpm repo clone <repository-url>
```

- **Navigate to the repository directory:**
```bash
cd $(cpm find <org-name/repo-name>)
```

#### Initialize cpm support

- **Initialize cpm**
```bash
cpm init
```

- **Add required plugins:**
```bash
cpm plugin add <plugin>
```

- **Configure plugin (Only if required)
```bash
cpm plugin configure <plugin>
```

#### Enable cpm flow (Easy development)

- **Enable cpm flow**
```bash
cpm flow enable
```

- **Checkout an issue to start development. This command supports interactive mode where you can select the task:**
```bash
cpm flow checkout
```

- **Submit issue for review**
```bash
cpm flow submit
```

## Commands

- [core](docs/core)
- [repo](docs/repo)
- [task](docs/task)
- [pr](docs/pr)
- [plugin](docs/plugin)
- [flow](docs/flow)

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
        run: cpm task get {{inputs.taskId}}
      - id: repo_checkout
        run: cpm repo checkout --branch {{get_task.outputs.id}}
    outputs:
      branchName: {{steps.get_task.outputs.id}}
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

## Contributing

For contributions, please refer to the [Contribution Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT](LICENSE).
