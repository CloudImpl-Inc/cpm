export type CPMConfig = Record<string, any>;

export type CPMPluginSecrets = Record<string, string>;

export type CPMPluginContext = {
    config: CPMConfig,
    secrets: CPMPluginSecrets,
}

export type ActionArgs = Record<string, any>;

export type ActionOptions = Record<string, any>;

export type ActionInput = {
    args: ActionArgs,
    options: ActionOptions,
}

export type ActionOutput = Record<string, string>;

export type Action = (ctx: CPMPluginContext, input: ActionInput) => ActionOutput | Promise<ActionOutput>;

export type CPMPlugin = {
    name: string,
    actions: Record<string, Action>,
}

export type CPMPluginCreator = (ctx: CPMPluginContext) => CPMPlugin | Promise<CPMPlugin>;