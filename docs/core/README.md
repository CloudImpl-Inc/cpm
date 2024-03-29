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

#### goto

Go to project folder. If there are multiple repositories available for given query this will prompt user to select.

```bash
cpm goto <query>
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