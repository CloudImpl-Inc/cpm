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