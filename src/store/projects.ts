import { defineStore } from "pinia";
import { Project } from "../libs/models/Project";
import { ref } from "vue";
import { Character } from "../libs/models/Character";

type ProjectStore = {
    project: Project | null,
    edited: boolean
}

export const useProjectStore = defineStore('projects',() => {
    const project = ref<Project | null>(null)

    // aliases for service methods
    function addCharacter(firstName: string, lastName: string, isFemale: boolean) {
        if (!project.value) return

        project.value.characters.add(new Character(
            firstName,
            lastName,
            isFemale
        ))
    }

    function editCharacter(character: Character) {
        if (!project.value) return

        project.value.characters.edit(character.id, character)
    }

    function deleteCharacter(id: string) {
        if (!project.value) return

        project.value.characters.delete(id)
    }

    return {
        project,
        addCharacter,
        editCharacter,
        deleteCharacter
    }
})