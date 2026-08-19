import type { Plot } from "../models/Plot";
import type { Database } from "../models/Database";

/** Provides CRUD operations for plots stored in a project's database. */
export class PlotService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.plots]
    }

    getById(id: string) {
        return this.database.plots.find((p) => p.id === id)
    }

    add(plot: Plot) {
        this.database.plots.push(plot);
    }

    edit(id: string, plot: Plot) {
        const index = this.database.plots.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.database.plots[index] = { ...plot, id };
        }
    }

    delete(id: string) {
        this.database.plots = this.database.plots.filter((p) => p.id !== id);
    }
}