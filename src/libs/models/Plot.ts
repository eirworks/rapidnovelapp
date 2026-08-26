/**
 * A plot/storyline belonging to a project.
 * Number is used for sorting plots in order.
 * Place ID references a Place in the same project's database.
 * Actors are characters (Character.id) with an assigned role
 * ('main' | 'protagonist' | 'antagonist' | 'support' | 'other').
 * Goal describes what the plot aims to achieve.
 *
 * Status indicates the lifecycle stage of the plot:
 *   pending   – planned but not yet started
 *   ongoing   – currently active
 *   completed – finished
 *   discard   – abandoned or no longer relevant
 */
/** Preset role values a character can have within a plot. */
export type ActorRole = 'main' | 'protagonist' | 'antagonist' | 'support' | 'other'

/** Describes a character's participation in a plot, including their role. */
export interface PlotActor {
    id: string       // Character.id
    role: ActorRole  // Preset + optional custom label via role
}

export class Plot {
    id: string // UUID
    name: string
    description: string = ''
    placeId: string | null = null
    actors: PlotActor[] = []
    number: number = 0
    goal: string = ''

    /** Lifecycle stage of this plot. */
    status: 'pending' | 'ongoing' | 'completed' | 'discard' = 'pending'

    /** The universe this plot belongs to, or empty when unassigned. */
    universeId: string = ''

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
}