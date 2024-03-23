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
cpm plugin add @cloudimpl-inc/cpm-clickup
```

- **Configure plugin (Only if required)
```bash
cpm plugin configure @cloudimpl-inc/cpm-clickup
```

#### Enable cpm flow (Easy development)

- **Enable cpm flow**
```bash
cpm flow init
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

### Core commands

#### init

Initialize a cpm project.

```bash
cpm init
```

#### list

List projects.

```bash
cpm list
```

#### find

Find repository cloned path. This will output the first found repository with the search pattern.

```bash
cpm find <query>
```

**Arguments:**
- `query`: Pattern to search. Example: `cpm find Cloudimpl-Inc/cpm`

**Outputs:**
- `org`: Organization name extracted from URL.
- `repo`: Repository name extracted from URL.
- `path`: Locally cloned directory.

#### sync

Sync project (sync plugins).

```bash
cpm sync
```

### Task related commands

#### task list

List tasks.

```bash
cpm task list [options]
```

**Options:**
- `-a, --assigned`: Only get tasks assigned to the current user.

#### task select

Select a task from the list.

```bash
cpm task select [options]
```

**Options:**
- `-a, --assigned`: Only get tasks assigned to the current user.

**Outputs:**
- `id`: Task ID.
- `title`: Task title.
- `status`: Task status.

#### task get

Get a task with ID.

```bash
cpm task get <id>
```

**Arguments:**
- `id`: ID of the task.

**Outputs:**
- `id`: Task ID.
- `title`: Task title.
- `status`: Task status.

#### task status

Update task status.

```bash
cpm task status <id> <status>
```

**Arguments:**
- `id`: ID of the task.
- `status`: New status of the task.

### Repo commands

#### repo clone

Clone a git repository to the root directory configured in ctx.config.rootDir.

```bash
cpm repo clone <url>
```

**Arguments:**
- `url`: URL of the git repository.

**Outputs:**
- `org`: Organization name extracted from URL.
- `repo`: Repository name extracted from URL.
- `path`: Locally cloned directory.

#### repo checkout

Checkout a branch inside the git repository. If the branch does not exist, create a branch from the default branch and update the default branch from upstream before creating a new branch.

```bash
cpm repo checkout [options]
```

**Options:**
- `-b, --branch <branch>`: Branch name to checkout (required).

#### repo sync

Synchronize the repository's current branch with remote.

```bash
cpm repo sync
```

#### repo info

Get info of the repository.

```bash
cpm repo info
```

**Outputs:**
- `currentBranch`: Current branch name.
- `changesPending`: Changes pending.

### Pull request commands

#### pr create

Create a pull request / merge request (currently only supports interactive mode).

```bash
cpm pr create <head> <base>
```

**Arguments:**
- `head`: Head branch name.
- `base`: Base branch name.

### Plugin management commands

#### plugin list

List plugin versions.

```bash
cpm plugin list [options]
```

**Options:**
- `-g, --global`: List global plugin versions.

#### plugin add

Install cpm plugin.

```bash
cpm plugin add <plugin> [options]
```

**Arguments:**
- `plugin`: Plugin name.

**Options:**
- `-g, --global`: Install plugin globally.

#### plugin remove

Uninstall cpm plugin.

```bash
cpm plugin remove <plugin> [options]
```

**Arguments:**
- `plugin`: Plugin name.

**Options:**
- `-g, --global`: Uninstall plugin globally.

#### plugin configure

Configure cpm plugin.

```bash
cpm plugin configure <plugin> [options]
```

**Arguments:**
- `plugin`: Plugin name.

**Options:**
- `-g, --global`: Configure plugin globally.

### CPM flow related commands

#### flow enable

Enable cpm flow.

```bash
cpm flow enable
```

#### flow configure

Configure cpm flow.

```bash
cpm flow configure
```

#### flow setup

Make repository ready to use cpm flow (every new clone should run this).

```bash
cpm flow setup
```

#### flow checkout

Checkout issue to start development.

```bash
cpm flow checkout [options]
```

**Options:**
- `-t, --taskId <taskId>`: Task ID to checkout.

#### flow submit

Create PR for issue for the current working issue.

```bash
cpm flow submit
```

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
