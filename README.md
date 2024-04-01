<p align="center">
<img width="300" alt="cpm logo" src="https://github.com/CloudImpl-Inc/cpm/assets/17607423/4b520bec-a0ec-4adf-afb8-c9045d57dd98">
</p>

**cpm** is a powerful command-line tool designed to streamline project management tasks. With **cpm**, you can easily initialize projects, clone repositories, manage tasks, synchronize projects, and much more—all from the comfort of your terminal.

## Philosophy
**cpm** was built with the philosophy of providing a simple yet powerful solution for project management in the command-line interface. Our core principles include:
- **Simplicity:** We believe in keeping things simple and intuitive. **cpm** is designed to be easy to use, with clear and concise commands that streamline project management tasks.
- **Flexibility:** We understand that every project is unique, and workflows may vary. That's why **cpm** offers a flexible plugin system that allows users to customize service integrations without disrupting their existing workflows.
- **Efficiency:** Our goal is to help users be more productive by automating repetitive tasks and providing tools to streamline project workflows. With **cpm**, you can spend less time on administrative tasks and more time on what matters—building great software.
- **Community-driven:** We believe in the power of community collaboration. **cpm** is an open-source project, and we welcome contributions from developers around the world. Together, we can continue to improve and evolve **cpm** to meet the needs of modern software development teams.

## Installation
>Note: For Windows users, when working with command-line tools like the CloudImpl cpm CLI, 
> it's strongly recommended to use Unix-like environments such as Git Bash or Windows Subsystem for Linux (WSL). 

### With install script
- Simply run `source <(curl -sSL https://raw.githubusercontent.com/CloudImpl-Inc/cpm/main/install.sh)`
>Note: To review script before execution view [install.sh](https://raw.githubusercontent.com/CloudImpl-Inc/cpm/main/install.sh) 

### Manual install
- Install cpm with `npm i -g @cloudimpl-inc/cpm`
- Then add cpm git plugin globally with `cpm plugin add -g @cloudimpl-inc/cpm-git`
- Copy output of this command `command -v cpm`
- Create alias to above command `alias cpm="source <output_of_above_command>"`
>Note: Creating this alias will make cpm goto <path> command work as expected

## Available plugins
- [Official plugins](https://cloudimpl-inc.github.io/cpm-plugin-pack/)
- [Community plugins](https://github.com/topics/cpm-plugin-community)

## Getting started
- To start using cpm, follow the [getting started](docs/getting-started) guide. Get your projects organized and managed efficiently in no time!

## Commands
- [cpm plugin](docs/plugin)
- [cpm project](docs/project)
- [cpm flow](docs/flow)
- [cpm template](docs/template)
- [cpm repo](docs/repo)
- [cpm task](docs/task)
- [cpm pr](docs/pr)

## Workflow management
To start using workflows, follow the [workflow](docs/workflow) guide. Streamline your processes effortlessly with automation—unlocking more time for what truly matters.

## Developing Plugins
Want to extend the functionality of cpm? Dive into our comprehensive guide on [developing plugins](docs/plugin-development)! Whether you're looking to integrate new services, automate custom workflows, or enhance existing features, this guide will walk you through the process step-by-step.

## Improving Command Definitions
Want to improve the functionality of cpm? Please refer to [improve commands](docs/improve-commands) for details on contributing improvements to command definitions.

## Contributing
For contributions, please refer to the [Contribution Guidelines](CONTRIBUTING.md).

## License
This project is licensed under the [MIT](LICENSE).
