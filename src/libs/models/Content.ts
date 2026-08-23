import type { Story } from "./Story";

/**
 * The writing side of a project — as opposed to `Database`, which holds the
 * reference data (characters, places, items, ...). Content holds everything
 * the author actually writes: stories today, with chapters and draft
 * documents planned next.
 */
export class Content {
    stories: Story[] = [];

    // TODO: chapters: Chapter[] = [];
    // TODO: drafts: Draft[] = [];
}
