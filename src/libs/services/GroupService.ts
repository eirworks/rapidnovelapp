import type { Group } from "../models/Group";
import type { Database } from "../models/Database";

export class GroupService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.groups]
    }

    getById(id: string) {
        return this.database.groups.find((g) => g.id === id)
    }

    add(group: Group) {
        this.database.groups.push(group);
    }

    edit(id: string, group: Group) {
        const index = this.database.groups.findIndex((g) => g.id === id);
        if (index !== -1) {
            this.database.groups[index] = { ...group, id };
        }
    }

    delete(id: string) {
        this.database.groups = this.database.groups.filter((g) => g.id !== id);
    }
}
