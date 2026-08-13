import { app, BrowserWindow, ipcMain, shell, Menu, type MenuItemConstructorOptions } from 'electron'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import {
  getConfig,
  initConfig,
  updateConfig,
  type AiProvider,
} from '../config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32' && os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// Forward a menu action to the renderer so it can switch views
function sendMenuAction(action: string) {
  win?.webContents.send('menu-action', action)
}

function createApplicationMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quick Write',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendMenuAction('quick-write'),
        },
        { type: 'separator' },
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => sendMenuAction('new-project'),
        },
        {
          label: 'Load Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendMenuAction('open-project'),
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendMenuAction('save-project'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => sendMenuAction('settings'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    // {
    //   label: 'Database',
    //   submenu: [
    //     { label: 'Characters', click: () => sendMenuAction('characters') },
    //     { label: 'Places', click: () => sendMenuAction('places') },
    //     { label: 'Items', click: () => sendMenuAction('items') },
    //     { label: 'Timeline', click: () => sendMenuAction('timeline') },
    //     { label: 'Plots', click: () => sendMenuAction('plots') },
    //   ],
    // },
    // {
    //   label: 'Write',
    //   submenu: [
    //     { label: 'Draft', click: () => sendMenuAction('draft') },
    //     { label: 'Story', click: () => sendMenuAction('story') },
    //     { label: 'Chapters', click: () => sendMenuAction('chapters') },
    //   ],
    // },
    {
      label: 'Help',
      submenu: [
        { label: 'Help', click: () => sendMenuAction('help') },
        { label: 'About', click: () => sendMenuAction('about') },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function createWindow() {
  win = new BrowserWindow({
    title: 'RapidNovel',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  initConfig()
  registerConfigIpc()
  createApplicationMenu()
  createWindow()
})

// Config IPC: the Settings page may read everything but only change
// non-hidden values (theme, AI providers). Hidden values are managed by app logic.
function registerConfigIpc() {
  ipcMain.handle('config:get', () => getConfig())

  ipcMain.handle('config:update', (_event, patch: unknown) => {
    const theme = (patch as { theme?: unknown } | null)?.theme
    if (theme !== 'auto' && theme !== 'dark' && theme !== 'light') {
      throw new Error('config:update only accepts a valid theme')
    }
    return updateConfig({ theme })
  })

  ipcMain.handle(
    'config:addAiProvider',
    (_event, input: unknown): AiProvider => {
      const provider = sanitizeAiProvider(input, /* requireId */ false)
      const config = getConfig()
      const created: AiProvider = {
        ...provider,
        id: randomUUID(),
        models: [...provider.models],
      }
      const next = updateConfig({
        aiProviders: [...config.aiProviders, created],
      })
      return next.aiProviders.find((p) => p.id === created.id) ?? created
    },
  )

  ipcMain.handle(
    'config:updateAiProvider',
    (_event, input: unknown): AiProvider => {
      const provider = sanitizeAiProvider(input, /* requireId */ true)
      const config = getConfig()
      if (!config.aiProviders.some((p) => p.id === provider.id)) {
        throw new Error('Provider not found')
      }
      const aiProviders = config.aiProviders.map((p) =>
        p.id === provider.id ? { ...provider, models: [...provider.models] } : p,
      )
      const next = updateConfig({ aiProviders })
      return next.aiProviders.find((p) => p.id === provider.id) ?? provider
    },
  )

  ipcMain.handle('config:deleteAiProvider', (_event, id: unknown) => {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid provider id')
    }
    const config = getConfig()
    const aiProviders = config.aiProviders.filter((p) => p.id !== id)
    updateConfig({ aiProviders })
  })
}

/** Validates a provider payload from the renderer and normalizes its fields. */
function sanitizeAiProvider(input: unknown, requireId: boolean): AiProvider {
  const raw =
    (typeof input === 'object' && input !== null ? input : {}) as Record<
      string,
      unknown
    >

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  if (!name) throw new Error('Provider name is required')

  const baseUrl = typeof raw.baseUrl === 'string' ? raw.baseUrl.trim() : ''
  if (!baseUrl) throw new Error('Base URL is required')
  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error('Base URL must start with http:// or https://')
  }

  const apiKey = typeof raw.apiKey === 'string' ? raw.apiKey : ''
  const models = Array.isArray(raw.models)
    ? raw.models.filter((m): m is string => typeof m === 'string')
    : []

  const id = requireId ? (typeof raw.id === 'string' ? raw.id : '') : ''
  if (requireId && !id) throw new Error('Provider id is required')

  return { id, name, baseUrl, apiKey, models }
}

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
