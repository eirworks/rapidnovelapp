import type { Character } from "./Character";
import type { Place } from "./Place";
import type { Item } from "./Item";
import type { Task } from "./Task";
import type { TaskGroup } from "./TaskGroup";
import type { Group } from "./Group";
import type { Timeline } from "./Timeline";
import type { Event } from "./Event";
import type { Plot } from "./Plot";
import type { Scene } from "./Scene";
import type { Universe } from "./Universe";

export class Database {
    characters: Character[] = [];
    places: Place[] = [];
    items: Item[] = [];
    groups: Group[] = [];
    tasks: Task[] = [];
    taskGroups: TaskGroup[] = [];
    timelines: Timeline[] = [];
    events: Event[] = [];

    plots: Plot[] = [];
    scenes: Scene[] = [];
    universes: Universe[] = [];
}