export type CPMConfig = Record<string, any>;

export type CPMVariables = Record<string, string>;

export type CPMSecrets = Record<string, string>;

export type CPMContext = {
    config: CPMConfig,
    variables: CPMVariables,
    secrets: CPMSecrets,
}

export type ActionArgs = Record<string, any>;

export type ActionOptions = Record<string, any>;

export type ActionInput = {
    args: ActionArgs,
    options: ActionOptions,
}

export type ActionOutput = Record<string, string>;

export type Action = (ctx: CPMContext, input: ActionInput) => ActionOutput | Promise<ActionOutput>;

export type CPMPlugin = {
    name: string,
    commands?: Record<string, CommandDef>,
    actions: Record<string, Action>,
}

export type CPMPluginCreator = (ctx: CPMContext) => CPMPlugin | Promise<CPMPlugin>;

export type WorkflowStep = {
    id: string;
    run: string;
}

export type Workflow = {
    inputs: string[];
    steps: WorkflowStep[];
    outputs: Record<string, string>
}

export type ArgumentDef = {
    description?: string;
};

export type OptionDef = {
    shortName?: string;
    description?: string;
};

export type OutputDef = {
    description?: string;
}

export type CommandDef = {
    description?: string,
    arguments?: Record<string, ArgumentDef>;
    options?: Record<string, OptionDef>;
    outputs?: Record<string, OutputDef>;
};