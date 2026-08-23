import { Database } from "./Database"
import { Content } from "./Content"
import { CharacterService } from "../services/CharacterService"
import { PlaceService } from "../services/PlaceService"
import { ItemService } from "../services/ItemService"
import { SkillService } from "../services/SkillService"
import { TaskService } from "../services/TaskService"
import { TaskGroupService } from "../services/TaskGroupService"
import { GroupService } from "../services/GroupService"
import { TimelineService } from "../services/TimelineService"
import { EventService } from "../services/EventService"
import { PlotService } from "../services/PlotService"
import { SceneService } from "../services/SceneService"
import { UniverseService } from "../services/UniverseService"
import { StoryService } from "../services/StoryService"

export class Project {
    id: string // UUID formatted
    name: string
    description: string | null = ""
    author: string | null = ""

    // Database, Content, and Management
    database: Database = new Database()
    content: Content = new Content()

    // Services
    characterService: CharacterService = new CharacterService(this.database)
    placeService: PlaceService = new PlaceService(this.database)
    itemService: ItemService = new ItemService(this.database)
    skillService: SkillService = new SkillService(this.database)
    taskService: TaskService = new TaskService(this.database)
    taskGroupService: TaskGroupService = new TaskGroupService(this.database)
    groupService: GroupService = new GroupService(this.database)
    timelineService: TimelineService = new TimelineService(this.database)
    eventService: EventService = new EventService(this.database)
    plotService: PlotService = new PlotService(this.database)
    sceneService: SceneService = new SceneService(this.database)
    universeService: UniverseService = new UniverseService(this.database)
    storyService: StoryService = new StoryService(this.content)

    // TODO update these types
    manager: string[] = []

    constructor(id: string, name: string, description: string, author: string) {
        this.id = id
        this.name = name
        this.description = description
        this.author = author
    }
}