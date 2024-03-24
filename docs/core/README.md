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