import { Database } from "./Database"
import { CharacterService } from "../services/CharacterService"
import { PlaceService } from "../services/PlaceService"
import { ItemService } from "../services/ItemService"

export class Project {
    id: string // UUID formatted
    name: string
    description: string | null = ""
    author: string | null = ""

    // Database, Content, and Management
    database: Database = new Database()
    characters: CharacterService = new CharacterService(this.database)
    places: PlaceService = new PlaceService(this.database)
    items: ItemService = new ItemService(this.database)

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