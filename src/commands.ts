type ArgumentDef = {
    description?: string;
};

type OptionDef = {
    shortName?: string;
    description?: string;
};

type OutputDef = {
    description?: string;
}

export type CommandDef = {
    description?: string,
    arguments?: Record<string, ArgumentDef>;
    options?: Record<string, OptionDef>;
    outputs?: Record<string, OutputDef>;
};

const commands: Record<string, CommandDef> = {
    "ls": {
        description: "list projects"
    },
    "sync": {
        description: "sync project (sync plugins)"
    },
    "task list": {
        description: "list tasks",
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
                description: "branch name to checkout"
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
    }
};

export default commands;