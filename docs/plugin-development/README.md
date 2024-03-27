## Developing plugin

### Setup repository
- **Create repository:**
Click [here](https://github.com/new?template_name=cpm-plugin-gs&template_owner=CloudImpl-Inc) to create repository with [cpm-plugin-gs](https://github.com/CloudImpl-Inc/cpm-plugin-gs) template.

- **Clone repository:**
```bash
cpm repo clone <url>
```

- **Go to repository:**
```bash
cd $(cpm find <repo-name>)
```

- **Fill template repository with actual values:**
Since this repo created from a template repository there are some variables which need user input before filling.
```bash
cpm template parse
```

### Start development
- Open `./plugin/src/index.ts` with your favourite code editor
- `actions: {}` object contains all the actions provided by plugin
- Key should mention the cpm command which this action handles (ex: `task ls`, `task get`, `repo clone`)
- To view command syntax run `cpm`
- `ctx` will contain config (`./cpm.yml`), variables and secrets store (which you can use to get or store new variables or secrets for plugin)
    - Use variables file to store values which will be accessed by multiple developers
    - Secrets file is only stored at developers machine
- `input` will contain all the arguments and options passed for command (according to the command syntax)

### Test locally
- Run `cpm` inside plugin repository (it should load plugin)
- Run any command provided by plugin and plugin should invoke the action

### Publish to npm
- Change README.md file content with actual content related to plugin (This will be used as the homepage for plugin)
- Login to npm with `npm login`
- Go to `./plugin` folder
- Publish plugin with `npm publish`

### Use plugin
- Go to repository where you need to install plugin
- Run `cpm install <plugin>` with plugin name
- Or if you want to install plugin globally run `cpm install <plugin> -g`