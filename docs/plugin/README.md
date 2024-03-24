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