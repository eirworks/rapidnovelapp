import type { Story } from "./Story";
import type { Chapter } from "./Chapter";

/**
 * The writing side of a project — as opposed to `Database`, which holds the
 * reference data (characters, places, items, ...). Content holds everything
 * the author actually writes: stories, their chapters, and draft
 * documents planned next.
 */
export class Content {
    stories: Story[] = [];

    chapters: Chapter[] = [];

    // TODO: drafts: Draft[] = [];
    // TODO: drafts: Draft[] = [];
}
