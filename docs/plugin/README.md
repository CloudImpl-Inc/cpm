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
- `-g, --global`: Uninstall globally installed plugin.

#### plugin purge

Uninstall cpm plugin and remove all configuration.

```bash
cpm plugin purge <plugin>
```

**Arguments:**
- `plugin`: Plugin name.

**Options:**
- `-g, --global`: Purge globally installed plugin.

#### plugin configure

Configure cpm plugin.

```bash
cpm plugin configure <plugin> [options]
```

**Arguments:**
- `plugin`: Plugin name.

**Options:**
- `-g, --global`: Configure plugin globally.