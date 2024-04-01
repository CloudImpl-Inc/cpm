### Repo commands

#### repo clone

Clone a repository.

```bash
cpm repo clone <url>
```

**Arguments:**
- `url`: URL of the repository.

**Options:**
- `-d, --destination <destination>`: Destination to clone (optional).

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