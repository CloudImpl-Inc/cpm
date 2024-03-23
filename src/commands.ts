import {CommandDef} from "./index";

const commands: Record<string, CommandDef> = {
    "init": {
        description: "initialized cpm project"
    },
    "list": {
        description: "list projects"
    },
    "find": {
        description: "find repository cloned path. this will output first found repository with search pattern",
        arguments: {
            "query": {
                description: "pattern to search ex: cpm find Cloudimpl-Inc/cpm"
            }
        },
        outputs: {
            "org": {
                description: "organization name extracted from url"
            },
            "repo": {
                description: "repo name extracted from url"
            },
            "path": {
                description: "locally cloned directory"
            }
        }
    },
    "sync": {
        description: "sync project (sync plugins)"
    },
    "task list": {
        description: "list tasks",
        options: {
            "assigned": {
                shortName: "a",
                description: "only get tasks assigned to current user"
            }
        }
    },
    "task select": {
        description: "select task from list",
        options: {
            "assigned": {
                shortName: "a",
                description: "only get tasks assigned to current user"
            }
        },
        outputs: {
            "id": {
                description: "task id"
            },
            "title": {
                description: "task title"
            },
            "status": {
                description: "task status"
            }
        }
    },
    "task get": {
        description: "get task with id",
        arguments: {
            "id": {
                description: "id of the task"
            }
        },
        outputs: {
            "id": {
                description: "task id"
            },
            "title": {
                description: "task title"
            },
            "status": {
                description: "task status"
            }
        }
    },
    "task status": {
        description: "update task status",
        arguments: {
            "id": {
                description: "id of the task"
            },
            "status": {
                description: "new status of the task"
            }
        }
    },
    "repo clone": {
        description: "clone git repository to root directory configured in ctx.config.rootDir",
        arguments: {
            "url": {
                description: "url of the git repository"
            }
        },
        outputs: {
            "org": {
                description: "organization name extracted from url"
            },
            "repo": {
                description: "repo name extracted from url"
            },
            "path": {
                description: "locally cloned directory"
            }
        }
    },
    "repo checkout": {
        description: "checkout branch inside git repository. if branch not exist create branch from default branch " +
            "and update default branch from upstream before creating new branch",
        options: {
            "branch": {
                shortName: "b",
                description: "branch name to checkout",
                valueRequired: true
            }
        }
    },
    "repo sync": {
        description: "synchronize repository current branch with remote"
    },
    "repo info": {
        description: "get info of repository",
        outputs: {
            currentBranch: {
                description: "current branch name"
            },
            changesPending: {
                description: "changes pending"
            }
        }
    },
    "pr create": {
        description: "create pull request / merge request (currently only support interactive mode)",
        arguments: {
            "head": {
                description: "head branch name"
            },
            "base": {
                description: "base branch name"
            }
        },
    },
    "plugin list": {
        description: "list plugin versions",
        options: {
            "global": {
                shortName: "g",
                description: "list global plugin versions"
            }
        }
    },
    "plugin add": {
        description: "install cpm plugin",
        arguments: {
            "plugin": {
                description: "plugin name"
            }
        },
        options: {
            "global": {
                shortName: "g",
                description: "install plugin globally"
            }
        }
    },
    "plugin remove": {
        description: "uninstall cpm plugin",
        arguments: {
            "plugin": {
                description: "plugin name"
            }
        },
        options: {
            "global": {
                shortName: "g",
                description: "install plugin globally"
            }
        }
    },
    "plugin configure": {
        description: "configure cpm plugin",
        arguments: {
            "plugin": {
                description: "plugin name"
            }
        },
        options: {
            "global": {
                shortName: "g",
                description: "install plugin globally"
            }
        }
    },
    "flow enable": {
        description: "enable cpm flow"
    },
    "flow configure": {
        description: "configure cpm flow"
    },
    "flow setup": {
        description: "make repository ready to use cpm flow (every new clone should run this)"
    },
    "flow checkout": {
        description: "checkout issue to start development",
        options: {
            "taskId": {
                shortName: "t",
                description: "task id to checkout"
            }
        }
    },
    "flow submit": {
        description: "create pr for issue for current working issue"
    }
};

export default commands;