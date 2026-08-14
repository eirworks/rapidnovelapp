import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { getConfig, setLastQuickWriteDir } from '../../config'

const QUICK_WRITE_FILTERS = [
  { name: 'Quick Write', extensions: ['json'] },
  { name: 'All files', extensions: ['*'] },
]

const TXT_FILTERS = [
  { name: 'Text', extensions: ['txt'] },
  { name: 'All files', extensions: ['*'] },
]

/**
 * Registers Quick Write file handlers: New is handled in the renderer, while
 * Save and Load use native dialogs and remember the last directory used.
 */
export function registerQuickWriteIpc(): void {
  ipcMain.handle(
    'quickwrite:save',
    async (event, content: unknown): Promise<{ path: string } | null> => {
      if (typeof content !== 'string') throw new Error('Invalid content')
      // Guard against writing a non-structured document to the .json file.
      let structured: unknown
      try {
        structured = JSON.parse(content)
      } catch {
        throw new Error('Invalid Quick Write document')
      }
      if (
        typeof structured !== 'object' ||
        structured === null ||
        !Array.isArray((structured as { items?: unknown }).items)
      ) {
        throw new Error('Invalid Quick Write document')
      }
      const config = getConfig()
      const defaultPath = path.join(
        config.lastQuickWriteDir || app.getPath('documents'),
        'quick-write.json',
      )
      const result = await showSaveDialog(event, defaultPath)
      if (result.canceled || !result.filePath) return null

      fs.writeFileSync(result.filePath, content, 'utf-8')
      setLastQuickWriteDir(path.dirname(result.filePath))
      return { path: result.filePath }
    },
  )

  ipcMain.handle(
    'quickwrite:saveTxt',
    async (event, content: unknown): Promise<{ path: string } | null> => {
      if (typeof content !== 'string') throw new Error('Invalid content')
      const config = getConfig()
      const defaultPath = path.join(
        config.lastQuickWriteDir || app.getPath('documents'),
        'quick-write.txt',
      )
      const result = await showSaveDialog(event, defaultPath, TXT_FILTERS)
      if (result.canceled || !result.filePath) return null

      fs.writeFileSync(result.filePath, content, 'utf-8')
      setLastQuickWriteDir(path.dirname(result.filePath))
      return { path: result.filePath }
    },
  )

  ipcMain.handle(
    'quickwrite:load',
    async (
      event,
    ): Promise<{ path: string; content: string } | null> => {
      const config = getConfig()
      const defaultPath = config.lastQuickWriteDir || undefined
      const result = await showOpenDialog(event, defaultPath)
      if (result.canceled || result.filePaths.length === 0) return null

      const filePath = result.filePaths[0]
      const content = fs.readFileSync(filePath, 'utf-8')
      setLastQuickWriteDir(path.dirname(filePath))
      return { path: filePath, content }
    },
  )
}

async function showSaveDialog(
  event: Electron.IpcMainInvokeEvent,
  defaultPath: string,
  filters: Electron.FileFilter[] = QUICK_WRITE_FILTERS,
) {
  const win = BrowserWindow.fromWebContents(event.sender)
  const options = {
    title: 'Save Quick Write',
    defaultPath,
    filters,
  }
  return win ? dialog.showSaveDialog(win, options) : dialog.showSaveDialog(options)
}

async function showOpenDialog(
  event: Electron.IpcMainInvokeEvent,
  defaultPath?: string,
) {
  const win = BrowserWindow.fromWebContents(event.sender)
  const options = {
    title: 'Load Quick Write',
    defaultPath,
    properties: ['openFile'],
    filters: QUICK_WRITE_FILTERS,
  }
  return win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options)
}
