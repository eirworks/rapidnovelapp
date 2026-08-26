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
  content?: ProjectContentData
  management?: ProjectManagementData
}

export interface ProjectDatabaseData {
  characters?: CharacterData[]
  places?: PlaceData[]
  items?: ItemData[]
  skills?: SkillData[]
  groups?: GroupData[]
  /**
   * @deprecated Tasks moved to `Management` (`ProjectData.management`). Still
   * read as a fallback when loading a save written before the move.
   */
  tasks?: TaskData[]
  taskGroups?: TaskGroupData[]
  plots?: PlotData[]
  scenes?: SceneData[]
  universes?: UniverseData[]
  timelines?: TimelineData[]
  events?: EventData[]
}

/**
 * The persisted shape of a project's writing side (`Content`). Stories and
 * their chapters live here; drafts will be added alongside them.
 */
export interface ProjectContentData {
  stories?: StoryData[]
  chapters?: ChapterData[]
}

/**
 * The persisted shape of a project's management side (`Management`). Tasks
 * live here; task groups and other planning structures will be added.
 */
export interface ProjectManagementData {
  tasks?: TaskData[]
  notes?: NoteData[]
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
  /** Ids of the skills this character possesses (many-to-many with Skill). */
  skillIds?: string[]
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

export interface SkillData {
  id: string
  name: string
  type: string
  description?: string
  ownerId?: string | null
  /** The universe this skill belongs to, or empty when unassigned. */
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

export interface NoteData {
  id: string
  title: string
  content?: string
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

/** Preset role values for a character within a plot. */
export type ActorRole = 'main' | 'protagonist' | 'antagonist' | 'support' | 'other'

/** Persisted shape of a plot-actor with its role. */
export interface PlotActorData {
  id: string
  role: ActorRole
}

export interface PlotData {
  id: string
  name: string
  description?: string
  placeId?: string | null
  /** @deprecated Replaced by `actors` — kept for backward-compatible loading. */
  actorIds?: string[]
  actors?: PlotActorData[]
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

export interface StoryData {
  id: string
  title: string
  summary?: string
  /** How the story is structured: a single book or chapter-based. */
  format?: string
}

export interface ChapterData {
  id: string
  /** Sort order of the chapter within its story. */
  number?: number
  /** Id of the owning story, or null for orphaned chapters. */
  storyId: string | null
  title: string
  content?: string
  note?: string | null
  warning?: string | null
  /** ISO date string, or null while the chapter is a draft. */
  publishedAt?: string | null
}

/** A lightweight project entry shown in the Load Project list. */
export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  author: string | null
  path: string
}
