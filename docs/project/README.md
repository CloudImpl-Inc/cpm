### Core commands

#### project init

Initialize a cpm project.

```bash
cpm project init
```

#### project list

List projects.

```bash
cpm project list
```

#### project clone

Clone a repository to the root directory configured in ctx.config.rootDir.

```bash
cpm repo clone <url>
```

**Arguments:**
- `url`: URL of the git repository.

**Outputs:**
- `org`: Organization name extracted from URL.
- `repo`: Repository name extracted from URL.
- `path`: Locally cloned directory.

#### project goto

Go to project folder. If there are multiple repositories available for given query this will prompt user to select.

```bash
cpm project goto <query>
```

**Arguments:**
- `query`: Pattern to search. Example: `cpm find Cloudimpl-Inc/cpm`

**Outputs:**
- `org`: Organization name extracted from URL.
- `repo`: Repository name extracted from URL.
- `path`: Locally cloned directory.

#### project sync

Sync project.

```bash
cpm prtoject sync
```