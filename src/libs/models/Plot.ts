/**
 * A plot/storyline belonging to a project.
 * Number is used for sorting plots in order.
 * Place ID references a Place in the same project's database.
 * Actor IDs reference characters (Character.id) involved in this plot.
 * Goal describes what the plot aims to achieve.
 *
 * Status indicates the lifecycle stage of the plot:
 *   pending   – planned but not yet started
 *   ongoing   – currently active
 *   completed – finished
 *   discard   – abandoned or no longer relevant
 */
export class Plot {
    id: string // UUID
    name: string
    description: string = ''
    placeId: string | null = null
    actorIds: string[] = []
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