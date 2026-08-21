import type { Skill } from "../models/Skill";
import type { Database } from "../models/Database";

/** CRUD access to the project's skill collection. */
export class SkillService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.skills]
    }

    getById(id: string) {
        return this.database.skills.find((s) => s.id === id)
    }

    add(skill: Skill) {
        this.database.skills.push(skill);
    }

    edit(id: string, skill: Skill) {
        const index = this.database.skills.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.database.skills[index] = { ...skill, id };
        }
    }

    delete(id: string) {
        this.database.skills = this.database.skills.filter((s) => s.id !== id);
    }
}
