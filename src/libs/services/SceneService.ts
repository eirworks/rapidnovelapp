import type { Scene } from "../models/Scene";
import type { Database } from "../models/Database";

/** Provides CRUD operations for scenes stored in a project's database. */
export class SceneService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.scenes];
    }

    getById(id: string) {
        return this.database.scenes.find((s) => s.id === id);
    }

    /** Returns all scenes belonging to the given plot, sorted by number. */
    getByPlot(plotId: string) {
        return this.database.scenes
            .filter((s) => s.plotId === plotId)
            .sort((a, b) => a.number - b.number);
    }

    add(scene: Scene) {
        this.database.scenes.push(scene);
    }

    edit(id: string, scene: Scene) {
        const index = this.database.scenes.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.database.scenes[index] = { ...scene, id };
        }
    }

    delete(id: string) {
        this.database.scenes = this.database.scenes.filter((s) => s.id !== id);
    }
}
