export interface MenuItem {
    label: string
    view: string
    icon?: string
}

export interface MenuGroup {
    label: string
    items: MenuItem[]
}
