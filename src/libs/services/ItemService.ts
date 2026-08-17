import type { Item } from "../models/Item";
import type { Database } from "../models/Database";

export class ItemService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.items]
    }

    getById(id: string) {
        return this.database.items.find((i) => i.id === id)
    }

    add(item: Item) {
        this.database.items.push(item);
    }

    edit(id: string, item: Item) {
        const index = this.database.items.findIndex((i) => i.id === id);
        if (index !== -1) {
            this.database.items[index] = { ...item, id };
        }
    }

    delete(id: string) {
        this.database.items = this.database.items.filter((i) => i.id !== id);
    }
}
