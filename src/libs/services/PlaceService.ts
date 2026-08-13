import type { Place } from "../models/Place";
import type { Database } from "../models/Database";

export class PlaceService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.places]
    }

    getById(id: string) {
        return this.database.places.find((p) => p.id === id)
    }

    add(place: Place) {
        this.database.places.push(place);
    }

    edit(id: string, place: Place) {
        const index = this.database.places.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.database.places[index] = { ...place, id };
        }
    }

    delete(id: string) {
        this.database.places = this.database.places.filter((p) => p.id !== id);
    }
}
