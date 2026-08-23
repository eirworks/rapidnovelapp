/**
 * The two supported ways a story can be structured: as a single self-contained
 * book, or as a multi-chapter work.
 */
export type StoryFormat = "book" | "chapters" | "scripts";

/**
 * A story within a project. Stores the identity fields only — the actual
 * writing and chapter management are left to future features.
 */
export class Story {
    id: string // UUID formatted
    title: string

    /** One or two sentence overview of what the story is about. */
    summary: string = ""

    /** How the story is structured: a single book or chapter-based. */
    format: StoryFormat = "book"

    constructor(title: string) {
        this.id = crypto.randomUUID()
        this.title = title
    }
}
