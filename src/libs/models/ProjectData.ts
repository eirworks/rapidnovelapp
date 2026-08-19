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
  groups?: GroupData[]
  tasks?: TaskData[]
  taskGroups?: TaskGroupData[]
  plots?: PlotData[]
  scenes?: SceneData[]
  universes?: UniverseData[]
  timelines?: TimelineData[]
  events?: EventData[]
}

export interface CharacterData {
  id: string
  firstName: string
  lastName: string
  isFemale: boolean
  birthdate?: string | null
  aliases?: string[]
  description?: string
  /** The universe this character belongs to, or empty when unassigned. */
  universeId?: string
  /** Saved as a plain object because `Map`s are flattened during serialization. */
  data?: Record<string, string>
}

export interface PlaceData {
  id: string
  name: string
  description?: string
  parentId?: string | null
  /** The universe this place belongs to, or empty when unassigned. */
  universeId?: string
}

export interface ItemData {
  id: string
  name: string
  type: string
  description?: string
  ownerId?: string | null
  /** The universe this item belongs to, or empty when unassigned. */
  universeId?: string
}

export interface GroupData {
  id: string
  name: string
  type: string
  description?: string
  memberIds?: string[]
  /** The universe this group belongs to, or empty when unassigned. */
  universeId?: string
}

export interface TaskData {
  id: string
  status: string
  task: string
  description?: string | null
  dueDate?: string | null
  groupId?: string | null
}

export interface TaskGroupData {
  id: string
  name: string
  description?: string | null
  dueDate?: string | null
}

export interface EventData {
  id: string
  name: string
  timelineId: string
  description?: string
  actorIds?: string[]
  date: string
}

export interface TimelineData {
  id: string
  name: string
  description?: string
  /** The universe this timeline belongs to, or empty when unassigned. */
  universeId?: string
}

export interface PlotData {
  id: string
  name: string
  description?: string
  placeId?: string | null
  actorIds?: string[]
  number?: number
  goal?: string
  /** The universe this plot belongs to, or empty when unassigned. */
  universeId?: string
}

export interface SceneData {
  id: string
  title: string
  description?: string
  plotId: string
  number?: number
  povCharacterId?: string | null
  /** The universe this scene belongs to, or empty when unassigned. */
  universeId?: string
}

export interface UniverseData {
  id: string
  name: string
  description?: string
}

/** A lightweight project entry shown in the Load Project list. */
export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  author: string | null
  path: string
}
