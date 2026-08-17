import type { Character } from "./Character";
import type { Place } from "./Place";
import type { Item } from "./Item";

export class Database {
    characters: Character[] = [];
    places: Place[] = [];
    items: Item[] = [];

    // TODO change type when the class is ready
    plots: string[] = [];
    universe: string[] = [];
    timeline: string[] = [];
}