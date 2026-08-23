import type { Story } from "../models/Story";
import type { Content } from "../models/Content";

export class StoryService {
    constructor(private content: Content) {}

    getAll() {
        return [...this.content.stories]
    }

    getById(id: string) {
        return this.content.stories.find((s) => s.id === id)
    }

    add(story: Story) {
        this.content.stories.push(story);
    }

    edit(id: string, story: Story) {
        const index = this.content.stories.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.content.stories[index] = { ...story, id };
        }
    }

    delete(id: string) {
        this.content.stories = this.content.stories.filter((s) => s.id !== id);
    }
}
