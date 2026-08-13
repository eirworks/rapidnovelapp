export interface MenuItem {
    label: string
    view: string
}

export interface MenuGroup {
    label: string
    items: MenuItem[]
}
