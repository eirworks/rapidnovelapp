import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { getConfig, setLastQuickWriteDir } from '../../config'

const TEXT_FILTERS = [
  { name: 'Text', extensions: ['txt', 'md'] },
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
      const config = getConfig()
      const defaultPath = path.join(
        config.lastQuickWriteDir || app.getPath('documents'),
        'quick-write.txt',
      )
      const result = await showSaveDialog(event, defaultPath)
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
) {
  const win = BrowserWindow.fromWebContents(event.sender)
  const options = {
    title: 'Save Quick Write',
    defaultPath,
    filters: TEXT_FILTERS,
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
    filters: TEXT_FILTERS,
  }
  return win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options)
}
