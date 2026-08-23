import { defineStore } from "pinia";
import { Project } from "../libs/models/Project";
import { Character } from "../libs/models/Character";
import { Place } from "../libs/models/Place";
import { Item } from "../libs/models/Item";
import { Skill } from "../libs/models/Skill";
import { Task } from "../libs/models/Task";
import { TaskGroup } from "../libs/models/TaskGroup";
import { Group } from "../libs/models/Group";
import { Timeline } from "../libs/models/Timeline";
import { Event } from "../libs/models/Event";
import { Plot } from "../libs/models/Plot";
import { Scene } from "../libs/models/Scene";
import type { CharacterData, ItemData, PlaceData, ProjectData, TaskData, TaskGroupData, GroupData, TimelineData, EventData, PlotData, SceneData, UniverseData, SkillData, StoryData } from "../libs/models/ProjectData";
import { Universe } from "../libs/models/Universe";
import { Story } from "../libs/models/Story";
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
        // Every project starts with a single default universe.
        project.value.universeService.add(new Universe("Main Universe"))
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
        loaded.database.skills = (data.database?.skills ?? []).map(toSkill)
        loaded.database.tasks = (data.database?.tasks ?? []).map(toTask)
        loaded.database.taskGroups = (data.database?.taskGroups ?? []).map(toTaskGroup)
        loaded.database.groups = (data.database?.groups ?? []).map(toGroup)
        loaded.database.plots = (data.database?.plots ?? []).map(toPlot)
        loaded.database.scenes = (data.database?.scenes ?? []).map(toScene)
        loaded.database.universes = (data.database?.universes ?? []).map(toUniverse)
        loaded.database.timelines = (data.database?.timelines ?? []).map(toTimeline)
        loaded.database.events = (data.database?.events ?? []).map(toEvent)
        loaded.content.stories = (data.content?.stories ?? []).map(toStory)
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
        character.universeId = data.universeId ?? ''
        character.skillIds = data.skillIds ?? []
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
        place.universeId = data.universeId ?? ''
        return place
    }

    /** Rebuilds an Item instance from its saved plain-data shape. */
    function toItem(data: ItemData): Item {
        const item = new Item(data.name, data.type as Item["type"])
        item.id = data.id
        item.description = data.description ?? ""
        item.ownerId = data.ownerId ?? null
        item.universeId = data.universeId ?? ''
        return item
    }

    /** Rebuilds a Skill instance from its saved plain-data shape. */
    function toSkill(data: SkillData): Skill {
        const skill = new Skill(data.name, data.type as Skill["type"])
        skill.id = data.id
        skill.description = data.description ?? ""
        skill.ownerId = data.ownerId ?? null
        skill.universeId = data.universeId ?? ''
        return skill
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

    /** Rebuilds an Event instance from its saved plain-data shape. */
    function toEvent(data: EventData): Event {
        const event = new Event(data.name, data.timelineId, data.date)
        event.id = data.id
        event.description = data.description ?? ''
        event.actorIds = data.actorIds ?? []
        return event
    }

    /** Rebuilds a Plot instance from its saved plain-data shape. */
    function toPlot(data: PlotData): Plot {
        const plot = new Plot(data.name)
        plot.id = data.id
        plot.description = data.description ?? ''
        plot.placeId = data.placeId ?? null
        plot.actorIds = data.actorIds ?? []
        plot.number = data.number ?? 0
        plot.goal = data.goal ?? ''
        plot.universeId = data.universeId ?? ''
        return plot
    }

    /** Rebuilds a Scene instance from its saved plain-data shape. */
    function toScene(data: SceneData): Scene {
        const scene = new Scene(data.title, data.plotId)
        scene.id = data.id
        scene.description = data.description ?? ''
        scene.number = data.number ?? 0
        scene.povCharacterId = data.povCharacterId ?? null
        scene.universeId = data.universeId ?? ''
        return scene
    }

    /** Rebuilds a Group instance from its saved plain-data shape. */
    function toGroup(data: GroupData): Group {
        const group = new Group(data.name, data.type as Group["type"])
        group.id = data.id
        group.description = data.description ?? ""
        group.memberIds = data.memberIds ?? []
        group.universeId = data.universeId ?? ''
        return group
    }

    /** Rebuilds a Timeline instance from its saved plain-data shape. */
    function toTimeline(data: TimelineData): Timeline {
        const timeline = new Timeline(data.name)
        timeline.id = data.id
        timeline.description = data.description ?? ""
        timeline.universeId = data.universeId ?? ''
        return timeline
    }

    /** Rebuilds a Universe instance from its saved plain-data shape. */
    function toUniverse(data: UniverseData): Universe {
        const universe = new Universe(data.name)
        universe.id = data.id
        universe.description = data.description ?? ""
        return universe
    }

    /** Rebuilds a Story instance from its saved plain-data shape. */
    function toStory(data: StoryData): Story {
        const story = new Story(data.title)
        story.id = data.id
        story.summary = data.summary ?? ''
        story.format = (data.format ?? 'book') as Story["format"]
        return story
    }

    /**
     * Simple aggregate counts shown as stats on the home view.
     * `database` sums the Character/Item/Place/Group counts; `contents` counts
     * the entries in the project's Content (stories today, chapters and drafts
     * later); `tasks` counts the task list.
     */
    const projectStats = computed(() => {
        if (!project.value) return null
        return {
            database:
                project.value.database.characters.length +
                project.value.database.items.length +
                project.value.database.skills.length +
                project.value.database.places.length +
                project.value.database.groups.length,
            contents: project.value.content.stories.length,
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
            skills: db.skills.length,
            groups: db.groups.length,
            tasks: db.tasks.length,
            taskGroups: db.taskGroups.length,
            plots: db.plots.length,
            scenes: db.scenes.length,
            universes: db.universes.length,
            timeline: db.timelines.length,
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
