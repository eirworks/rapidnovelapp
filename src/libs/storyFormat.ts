import type { StoryFormat } from "../models/Story";

/** Human-readable label for a story's format, shown as a badge. */
export function formatLabel(format: StoryFormat): string {
    return format === "book" ? "Book" : "Chapters";
}
