import { defineStore } from "pinia";
import { Project } from "../libs/models/Project";
import { Character } from "../libs/models/Character";
import { Place } from "../libs/models/Place";
import type { CharacterData, PlaceData, ProjectData } from "../libs/models/ProjectData";
import { ref } from "vue";

export const useProjectStore = defineStore('projects',() => {
    const project = ref<Project | null>(null)

    /** Creates a new project and makes it the active project in the store. */
    function createProject(name: string, description: string, author: string) {
        project.value = new Project(
            crypto.randomUUID(),
            name,
            description,
            author
        )
    }

    /** Loads a previously saved project into the active project in the store. */
    function loadProject(data: ProjectData) {
        const loaded = new Project(
            data.id,
            data.name,
            data.description ?? '',
            data.author ?? ''
        )
        loaded.description = data.description
        loaded.author = data.author
        loaded.database.characters = (data.database?.characters ?? []).map(toCharacter)
        loaded.database.places = (data.database?.places ?? []).map(toPlace)
        loaded.database.items = data.database?.items ?? []
        loaded.database.plots = data.database?.plots ?? []
        loaded.database.universe = data.database?.universe ?? []
        loaded.database.timeline = data.database?.timeline ?? []
        loaded.contents = data.contents ?? []
        loaded.manager = data.manager ?? []
        project.value = loaded
    }

    /** Rebuilds a Character instance from its saved plain-data shape. */
    function toCharacter(data: CharacterData): Character {
        const character = new Character(data.firstName, data.lastName, data.isFemale)
        character.id = data.id
        character.birthdate = data.birthdate ?? null
        character.aliases = data.aliases ?? []
        character.description = data.description ?? ''
        // `data` was flattened to a plain object during save; restore the Map.
        character.data = new Map(Object.entries(data.data ?? {}))
        return character
    }

    /** Rebuilds a Place instance from its saved plain-data shape. */
    function toPlace(data: PlaceData): Place {
        const place = new Place(data.name)
        place.id = data.id
        place.description = data.description ?? ""
        place.parentId = data.parentId ?? null
        return place
    }

    /** Updates the active project's metadata (name, description, author). */
    function editProject(name: string, description: string, author: string) {
        if (!project.value) return

        project.value.name = name
        project.value.description = description
        project.value.author = author
    }

    // aliases for service methods
    function addCharacter(character: Character) {
        if (!project.value) return

        project.value.characters.add(character)
    }

    function editCharacter(character: Character) {
        if (!project.value) return

        project.value.characters.edit(character.id, character)
    }

    function deleteCharacter(id: string) {
        if (!project.value) return

        project.value.characters.delete(id)
    }

    function addPlace(place: Place) {
        if (!project.value) return

        project.value.places.add(place)
    }

    function editPlace(place: Place) {
        if (!project.value) return

        project.value.places.edit(place.id, place)
    }

    function deletePlace(id: string) {
        if (!project.value) return

        project.value.places.delete(id)
    }

    return {
        project,
        createProject,
        loadProject,
        editProject,
        addCharacter,
        editCharacter,
        deleteCharacter,
        addPlace,
        editPlace,
        deletePlace
    }
})
