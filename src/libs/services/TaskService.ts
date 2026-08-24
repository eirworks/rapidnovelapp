import type { Task } from "../models/management/Task";
import type { Management } from "../models/Management";

export class TaskService {
    constructor(private management: Management) {}

    getAll() {
        return [...this.management.tasks]
    }

    getById(id: string) {
        return this.management.tasks.find((t) => t.id === id)
    }

    add(task: Task) {
        this.management.tasks.push(task);
    }

    edit(id: string, task: Task) {
        const index = this.management.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
            this.management.tasks[index] = { ...task, id };
        }
    }

    delete(id: string) {
        this.management.tasks = this.management.tasks.filter((t) => t.id !== id);
    }
}
