import type { MenuGroup } from './models/MenuGroup'

/**
 * Grouped menus shown on the home view when a project is open, matching the
 * commented-out Database and Write menus in electron/main/index.ts.
 *
 * Each item carries a bootstrap icon name ('bs:' prefix) used by the home
 * view's menu buttons.
 */
export const menus: MenuGroup[] = [
  {
    label: 'Database',
    items: [
      { label: 'Characters', view: 'characters', icon: 'bs:people-fill' },
      { label: 'Places', view: 'places', icon: 'bs:geo-alt' },
      { label: 'Items', view: 'items', icon: 'bs:box' },
      { label: 'Groups', view: 'groups', icon: 'bs:collection' },
      { label: 'Timeline', view: 'timeline', icon: 'bs:clock-history' },
      { label: 'Plots', view: 'plots', icon: 'bs:diagram-3' },
    ],
  },
  {
    label: 'Write',
    items: [
      { label: 'Draft', view: 'draft', icon: 'bs:pencil' },
      { label: 'Story', view: 'story', icon: 'bs:book' },
      { label: 'Chapters', view: 'chapters', icon: 'bs:list-ul' },
    ],
  },
  {
    label: "Management",
    items: [
        { label: 'Tasks', view: 'tasks', icon: 'bs:clipboard-check' },
    ]
  }
]
