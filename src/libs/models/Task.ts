/**
 * The supported task statuses. `Task.status` is one of these strings.
 * Extend this list (and the `TaskStatus` union) to add new statuses.
 */
export const TASK_STATUSES = [
  'pending',
  'working',
  'finished',
  'cancelled',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export class Task {
    id: string // UUID
    status: TaskStatus
    /** The task's short text, e.g. "Write plot for Sansa Stark marriage". */
    task: string

    // non constructor properties
    description: string | null = null
    /** Due date as an ISO date string (`YYYY-MM-DD`), or null when unset. */
    dueDate: string | null = null
    /** The id of the owning task group, or null when the task has no group. */
    groupId: string | null = null

    constructor(task: string, status: TaskStatus) {
        this.id = crypto.randomUUID()
        this.task = task
        this.status = status
    }
}
