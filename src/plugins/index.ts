import RootPlugin from "./root-plugin";
import ProjectPlugin from "./project-plugin";
import FlowPlugin from "./flow-plugin";
import TemplatePlugin from "./template-plugin";

const plugins = [
    {
        name: 'inbuilt/root',
        creator: RootPlugin
    },
    {
        name: 'inbuilt/project',
        creator: ProjectPlugin
    },
    {
        name: 'inbuilt/flow',
        creator: FlowPlugin
    },
    {
        name: 'inbuilt/template',
        creator: TemplatePlugin
    }
];

export default plugins;