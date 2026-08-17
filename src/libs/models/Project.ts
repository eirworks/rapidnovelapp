import { Database } from "./Database"
import { CharacterService } from "../services/CharacterService"
import { PlaceService } from "../services/PlaceService"
import { ItemService } from "../services/ItemService"
import { TaskService } from "../services/TaskService"
import { TaskGroupService } from "../services/TaskGroupService"
import { GroupService } from "../services/GroupService"

export class Project {
    id: string // UUID formatted
    name: string
    description: string | null = ""
    author: string | null = ""

    // Database, Content, and Management
    database: Database = new Database()

    // Services
    characterService: CharacterService = new CharacterService(this.database)
    placeService: PlaceService = new PlaceService(this.database)
    itemService: ItemService = new ItemService(this.database)
    taskService: TaskService = new TaskService(this.database)
    taskGroupService: TaskGroupService = new TaskGroupService(this.database)
    groupService: GroupService = new GroupService(this.database)

    // TODO update these types
    contents: string[] = []
    manager: string[] = []

    constructor(id: string, name: string, description: string, author: string) {
        this.id = id
        this.name = name
        this.description = description
        this.author = author
    }
}