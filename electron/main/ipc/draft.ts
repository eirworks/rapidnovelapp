import { ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { getProjectsDir } from '../../config'

/** Lightweight draft entry returned by the drafts list. */
interface DraftSummary {
  id: string
  title: string
  storyId: string | null
  updatedAt: string
}

/**
 * Root directory that holds a project's drafts:
 * `~/.rapidnovel/projects/<project-id>/drafts/`. Each draft is a single
 * `<draftId>.json` file (a serialized DraftDocument).
 */
function draftsDir(projectId: string): string {
  return path.join(getProjectsDir(), projectId, 'drafts')
}

/** Full path to a draft file: `drafts/<draftId>.json`. */
function draftFilePath(projectId: string, draftId: string): string {
  return path.join(draftsDir(projectId), `${draftId}.json`)
}

/**
 * Validates that a value is a safe path segment (the app only ever generates
 * UUID-style ids), so ids can never escape the drafts directory.
 */
function assertSafeId(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`Invalid ${label}`)
  }
}

/**
 * Registers Draft IPC handlers. Drafts are stored in the project's drafts
 * directory as `<draftId>.json` — one file per draft, no native dialogs.
 */
export function registerDraftIpc(): void {
  // Lists every draft of a project by reading each `drafts/<id>.json` header.
  ipcMain.handle(
    'draft:list',
    async (_event, projectId: unknown): Promise<DraftSummary[]> => {
      assertSafeId(projectId, 'project id')
      const dir = draftsDir(projectId)
      if (!fs.existsSync(dir)) return []

      const summaries: DraftSummary[] = []
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) continue
        const filePath = path.join(dir, entry.name)
        try {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          const id = parsed?.id
          if (typeof id !== 'string' || id.length === 0) continue
          summaries.push({
            id,
            title: typeof parsed.title === 'string' ? parsed.title : 'Untitled',
            storyId: typeof parsed.storyId === 'string' ? parsed.storyId : null,
            updatedAt: fs.statSync(filePath).mtime.toISOString(),
          })
        } catch {
          // Skip unreadable or corrupt draft files.
        }
      }
      // Most recently edited drafts first.
      summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      return summaries
    },
  )

  // Loads a draft file; `content` is the raw DraftDocument JSON string.
  ipcMain.handle(
    'draft:load',
    async (
      _event,
      projectId: unknown,
      draftId: unknown,
    ): Promise<{ content: string }> => {
      assertSafeId(projectId, 'project id')
      assertSafeId(draftId, 'draft id')
      const filePath = draftFilePath(projectId, draftId)
      if (!fs.existsSync(filePath)) throw new Error('Draft not found')
      return { content: fs.readFileSync(filePath, 'utf-8') }
    },
  )

  // Writes a draft to `drafts/<draftId>.json`, creating the directory as needed.
  ipcMain.handle(
    'draft:save',
    async (
      _event,
      projectId: unknown,
      draftId: unknown,
      content: unknown,
    ): Promise<{ path: string }> => {
      assertSafeId(projectId, 'project id')
      assertSafeId(draftId, 'draft id')
      if (typeof content !== 'string') throw new Error('Invalid content')
      // Guard against writing a non-structured document to the .json file.
      let structured: unknown
      try {
        structured = JSON.parse(content)
      } catch {
        throw new Error('Invalid draft document')
      }
      if (
        typeof structured !== 'object' ||
        structured === null ||
        !Array.isArray((structured as { items?: unknown }).items)
      ) {
        throw new Error('Invalid draft document')
      }
      const dir = draftsDir(projectId)
      fs.mkdirSync(dir, { recursive: true })
      const filePath = draftFilePath(projectId, draftId)
      fs.writeFileSync(filePath, content, 'utf-8')
      return { path: filePath }
    },
  )

  // Removes a draft file (no-op when it does not exist).
  ipcMain.handle(
    'draft:delete',
    async (_event, projectId: unknown, draftId: unknown): Promise<void> => {
      assertSafeId(projectId, 'project id')
      assertSafeId(draftId, 'draft id')
      const filePath = draftFilePath(projectId, draftId)
      if (fs.existsSync(filePath)) fs.rmSync(filePath)
    },
  )
}
