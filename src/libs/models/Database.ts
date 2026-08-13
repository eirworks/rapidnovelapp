import type { Character } from "./Character";
import type { Place } from "./Place";

export class Database {
    characters: Character[] = [];
    places: Place[] = [];

    // TODO change type when the class is ready
    items: string[] = [];
    plots: string[] = [];
    universe: string[] = [];
    timeline: string[] = [];
}