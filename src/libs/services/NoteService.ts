import type { Note } from "../models/management/Note";
import type { Management } from "../models/Management";

/**
 * CRUD operations over the project's notes. Mirrors `TaskService`, working
 * directly on the `Management.notes` array it is constructed with.
 */
export class NoteService {
    constructor(private management: Management) {}

    getAll() {
        return [...this.management.notes]
    }

    getById(id: string) {
        return this.management.notes.find((n) => n.id === id)
    }

    add(note: Note) {
        this.management.notes.push(note);
    }

    edit(id: string, note: Note) {
        const index = this.management.notes.findIndex((n) => n.id === id);
        if (index !== -1) {
            this.management.notes[index] = { ...note, id };
        }
    }

    delete(id: string) {
        this.management.notes = this.management.notes.filter((n) => n.id !== id);
    }
}
