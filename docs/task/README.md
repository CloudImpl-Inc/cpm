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