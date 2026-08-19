/**
 * A scene belonging to a project's plot.
 * Plot ID references the parent Plot in the same project's database.
 * Character ID (labelled as POV) references a character who serves as the
 * point-of-view for this scene.
 * Number is used for sorting scenes within their plot.
 */
export class Scene {
    id: string // UUID
    plotId: string // Parent plot identifier
    title: string
    description: string = ''
    number: number = 0
    povCharacterId: string | null = null // Point-of-view character

    /** The universe this scene belongs to, or empty when unassigned. */
    universeId: string = ''

    constructor(title: string, plotId: string) {
        this.id = crypto.randomUUID()
        this.title = title
        this.plotId = plotId
    }
}
