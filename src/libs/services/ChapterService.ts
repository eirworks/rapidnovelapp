import type { Content } from "../models/Content";
import type { Chapter } from "../models/Chapter";

/**
 * Read-only access to a project's chapters. Chapters are only ever created by
 * publishing a draft (see DraftFormView), so this service exposes lookups and
 * the single creation path.
 */
export class ChapterService {
    constructor(private content: Content) {}

    getAll() {
        return [...this.content.chapters]
    }

    getById(id: string) {
        return this.content.chapters.find((c) => c.id === id)
    }

    /** All chapters of a story, sorted by their chapter number. */
    getByStoryId(storyId: string): Chapter[] {
        return this.content.chapters
            .filter((c) => c.storyId === storyId)
            .sort((a, b) => a.number - b.number)
    }

    /** Appends a chapter to the project. Chapters cannot be edited manually. */
    add(chapter: Chapter) {
        this.content.chapters.push(chapter)
    }
}
