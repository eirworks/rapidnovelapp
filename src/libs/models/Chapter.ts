/**
 * A single chapter belonging to a story. Chapters are ordered within their
 * story by `number`, and are either drafts (`publishedAt` is null) or
 * published (`publishedAt` holds the publication date).
 */
export class Chapter {
    id: string // UUID formatted

    /** Sort order of the chapter within its story. */
    number: number = 0

    /**
     * The id of the story this chapter belongs to, or null when the chapter
     * is orphaned (it doesn't belong to any story).
     */
    storyId: string | null

    title: string

    /** The chapter's body text. */
    content: string = ""

    /** Optional author-facing note. Not shown to readers. */
    note: string | null = null

    /** Optional content warning shown before the chapter body. */
    warning: string | null = null

    /** ISO date string of when the chapter was published, or null while it is a draft. */
    publishedAt: string | null = null

    constructor(storyId: string | null, title: string) {
        this.id = crypto.randomUUID()
        this.storyId = storyId
        this.title = title
    }

    /** A chapter counts as published once it has a publication date. */
    get isPublished(): boolean {
        return this.publishedAt !== null
    }
}
