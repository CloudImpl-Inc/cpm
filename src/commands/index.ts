import Root from './root';
import Task from './task';
import Repo from './repo';
import Plugin from './plugin';
import {CPMCommand} from "../util";

const commands: CPMCommand[] = [Root, Task, Repo, Plugin]

export default commands;