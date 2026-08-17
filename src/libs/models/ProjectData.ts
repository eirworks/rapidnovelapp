/**
 * Shapes of the data read back from a saved `project.json`. These mirror the
 * persisted `Project` snapshot produced by the Save Project flow and are used
 * by the project store when loading a saved project.
 */

export interface ProjectData {
  id: string
  name: string
  description: string | null
  author: string | null
  database?: ProjectDatabaseData
  contents?: string[]
  manager?: string[]
}

export interface ProjectDatabaseData {
  characters?: CharacterData[]
  places?: PlaceData[]
  items?: ItemData[]
  plots?: string[]
  universe?: string[]
  timeline?: string[]
}

export interface CharacterData {
  id: string
  firstName: string
  lastName: string
  isFemale: boolean
  birthdate?: string | null
  aliases?: string[]
  description?: string
  /** Saved as a plain object because `Map`s are flattened during serialization. */
  data?: Record<string, string>
}

export interface PlaceData {
  id: string
  name: string
  description?: string
  parentId?: string | null
}

export interface ItemData {
  id: string
  name: string
  type: string
  description?: string
  ownerId?: string | null
}

/** A lightweight project entry shown in the Load Project list. */
export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  author: string | null
  path: string
}
