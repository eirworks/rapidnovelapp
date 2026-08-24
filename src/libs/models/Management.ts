import type { Task } from "./management/Task"
import type { Note } from "./management/Note"

/**
 * The management side of a project — as opposed to `Database`, which holds the
 * reference data (characters, places, items, ...), and `Content`, which holds
 * the writing. Management holds everything the author plans and tracks:
 * tasks first, with task groups and other planning structures to come.
 */
export class Management {
    tasks: Task[] = [];
    notes: Note[] = [];
}
