import type { Character } from "../models/Character";
import type { Database } from "../models/Database";

export class CharacterService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.characters]
    }

    getById(id: string) {
        return this.database.characters.find((c) => c.id === id)
    }

    add(character: Character) {
        this.database.characters.push(character);
    }

    edit(id: string, character: Character) {
        const index = this.database.characters.findIndex((c) => c.id === id);
        if (index !== -1) {
            this.database.characters[index] = { ...character, id };
        }
    }

    delete(id: string) {
        this.database.characters = this.database.characters.filter((c) => c.id !== id);
    }
}