import type { Universe } from "../models/Universe"
import type { Database } from "../models/Database"

/** CRUD operations over the universes collection in a Database. */
export class UniverseService {
    constructor(private database: Database) {}

    getAll(): Universe[] {
        return [...this.database.universes]
    }

    getById(id: string): Universe | undefined {
        return this.database.universes.find((u) => u.id === id)
    }

    add(universe: Universe): void {
        this.database.universes.push(universe)
    }

    edit(id: string, universe: Universe): void {
        const index = this.database.universes.findIndex((u) => u.id === id)
        if (index !== -1) {
            this.database.universes[index] = { ...universe, id }
        }
    }

    delete(id: string): void {
        this.database.universes = this.database.universes.filter((u) => u.id !== id)
    }
}
