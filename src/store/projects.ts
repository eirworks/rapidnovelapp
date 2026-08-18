import { defineStore } from "pinia";
import { Project } from "../libs/models/Project";
import { Character } from "../libs/models/Character";
import { Place } from "../libs/models/Place";
import { Item } from "../libs/models/Item";
import { Task } from "../libs/models/Task";
import { TaskGroup } from "../libs/models/TaskGroup";
import { Group } from "../libs/models/Group";
import type { CharacterData, ItemData, PlaceData, ProjectData, TaskData, TaskGroupData, GroupData } from "../libs/models/ProjectData";
import { computed, ref } from "vue";

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
        loaded.database.items = (data.database?.items ?? []).map(toItem)
        loaded.database.tasks = (data.database?.tasks ?? []).map(toTask)
        loaded.database.taskGroups = (data.database?.taskGroups ?? []).map(toTaskGroup)
        loaded.database.groups = (data.database?.groups ?? []).map(toGroup)
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

    /** Rebuilds an Item instance from its saved plain-data shape. */
    function toItem(data: ItemData): Item {
        const item = new Item(data.name, data.type as Item["type"])
        item.id = data.id
        item.description = data.description ?? ""
        item.ownerId = data.ownerId ?? null
        return item
    }

    /** Rebuilds a Task instance from its saved plain-data shape. */
    function toTask(data: TaskData): Task {
        const task = new Task(data.task, data.status as Task["status"])
        task.id = data.id
        task.description = data.description ?? null
        task.dueDate = data.dueDate ?? null
        task.groupId = data.groupId ?? null
        return task
    }

    /** Rebuilds a TaskGroup instance from its saved plain-data shape. */
    function toTaskGroup(data: TaskGroupData): TaskGroup {
        const group = new TaskGroup(data.name)
        group.id = data.id
        group.description = data.description ?? null
        group.dueDate = data.dueDate ?? null
        return group
    }

    /** Rebuilds a Group instance from its saved plain-data shape. */
    function toGroup(data: GroupData): Group {
        const group = new Group(data.name, data.type as Group["type"])
        group.id = data.id
        group.description = data.description ?? ""
        group.memberIds = data.memberIds ?? []
        return group
    }

    /**
     * Simple aggregate counts shown as stats on the home view.
     * `database` sums the Character/Item/Place/Group counts; `contents` is 0
     * because the contents feature is not implemented yet.
     */
    const projectStats = computed(() => {
        if (!project.value) return null
        return {
            database:
                project.value.database.characters.length +
                project.value.database.items.length +
                project.value.database.places.length +
                project.value.database.groups.length,
            contents: project.value.contents.length,
            tasks: project.value.database.tasks.length,
        }
    })

    /**
     * Per-collection counts of every database list, used by the Reports page.
     */
    const databaseStats = computed(() => {
        if (!project.value) return null
        const db = project.value.database
        return {
            characters: db.characters.length,
            places: db.places.length,
            items: db.items.length,
            groups: db.groups.length,
            tasks: db.tasks.length,
            taskGroups: db.taskGroups.length,
            plots: db.plots.length,
            universe: db.universe.length,
            timeline: db.timeline.length,
        }
    })

    /** Updates the active project's metadata (name, description, author). */
    function editProject(name: string, description: string, author: string) {
        if (!project.value) return

        project.value.name = name
        project.value.description = description
        project.value.author = author
    }

    return {
        project,
        projectStats,
        databaseStats,
        createProject,
        loadProject,
        editProject
    }
})
