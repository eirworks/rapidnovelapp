/**
 * The supported skill categories. `Skill.type` is one of these strings.
 * Extend this list (and the `SkillType` union) to add new categories.
 */
export const SKILL_TYPES = [
  'Combat',
  'Magic',
  'Craft',
  'Knowledge',
  'Social',
  'Survival',
  'Other',
] as const

export type SkillType = (typeof SKILL_TYPES)[number]

/**
 * An ability or proficiency owned by a character (e.g. swordsmanship,
 * fire magic, lockpicking). Mirrors the `Item` shape: a typed entry in the
 * database with an optional owning character and universe.
 */
export class Skill {
    id: string // UUID
    name: string
    type: SkillType

    // non constructor properties
    description: string = ""
    /** The id of the character who possesses the skill, or null when unassigned. */
    ownerId: string | null = null

    /** The universe this skill belongs to, or empty when unassigned. */
    universeId: string = ''

    constructor(name: string, type: SkillType) {
        this.id = crypto.randomUUID()
        this.name = name
        this.type = type
    }
}
