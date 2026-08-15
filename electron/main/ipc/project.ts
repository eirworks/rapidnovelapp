import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Root directory that holds all saved projects: `~/.rapidnovel/project`.
 * Each project lives in its own subfolder named after its id.
 */
function projectsRoot(): string {
  return path.join(app.getPath('home'), '.rapidnovel', 'project')
}

/** Lightweight project entry returned by the Load Project list. */
interface ProjectSummary {
  id: string
  name: string
  description: string | null
  author: string | null
  path: string
}

/** Path to a project's JSON file, or null when the file does not exist. */
function projectJsonPath(id: string): string | null {
  const filePath = path.join(projectsRoot(), id, 'project.json')
  return fs.existsSync(filePath) ? filePath : null
}

/**
 * Registers IPC handlers that persist and load project data. The renderer
 * sends a plain project snapshot to save, and lists/loads saved projects.
 */
export function registerProjectIpc(): void {
  ipcMain.handle(
    'project:save',
    async (_event, json: unknown): Promise<{ path: string }> => {
      if (typeof json !== 'string') {
        throw new Error('Invalid project: expected a JSON string')
      }
      let project: { id?: unknown }
      try {
        project = JSON.parse(json)
      } catch {
        throw new Error('Invalid project: not valid JSON')
      }
      const id = project.id
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error('Invalid project: missing id')
      }
      const projectDir = path.join(projectsRoot(), id)
      fs.mkdirSync(projectDir, { recursive: true })
      const filePath = path.join(projectDir, 'project.json')
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8')
      return { path: filePath }
    },
  )

  // Lists every saved project by reading each `project/<id>/project.json`.
  ipcMain.handle('project:list', async (): Promise<ProjectSummary[]> => {
    const root = projectsRoot()
    if (!fs.existsSync(root)) return []
    const summaries: ProjectSummary[] = []
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const filePath = projectJsonPath(entry.name)
      if (!filePath) continue
      try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        const id = parsed?.id
        if (typeof id !== 'string' || id.length === 0) continue
        summaries.push({
          id,
          name: typeof parsed.name === 'string' ? parsed.name : 'Untitled',
          description:
            typeof parsed.description === 'string' ? parsed.description : null,
          author: typeof parsed.author === 'string' ? parsed.author : null,
          path: filePath,
        })
      } catch {
        // Skip unreadable or corrupt project files.
      }
    }
    summaries.sort((a, b) => a.name.localeCompare(b.name))
    return summaries
  })

  // Loads the full saved project data for a given project id.
  ipcMain.handle('project:load', async (_event, id: unknown): Promise<unknown> => {
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('Invalid project id')
    }
    const filePath = projectJsonPath(id)
    if (!filePath) {
      throw new Error('Project not found')
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  })
}
