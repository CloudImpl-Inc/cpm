export type CPMConfig = Record<string, any>;

export type CPMSecrets = Record<string, string>;

export type CPMContext = {
    config: CPMConfig,
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