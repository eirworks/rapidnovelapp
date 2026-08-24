/**
 * A free-form note for capturing ideas and planning details. Notes are
 * intentionally lightweight — just a title and a body of text — and live
 * under `Management` alongside tasks.
 */
export class Note {
    id: string // UUID
    title: string
    content: string

    constructor(title: string, content = '') {
        this.id = crypto.randomUUID()
        this.title = title
        this.content = content
    }
}
