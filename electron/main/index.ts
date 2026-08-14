import { app, BrowserWindow, ipcMain, nativeTheme, shell, Menu, type MenuItemConstructorOptions } from 'electron'
import { createRequire } from 'node:module'
import { getConfig, initConfig, updateConfig, type Theme } from '../config'
import { registerAiProviderIpc } from './ipc/aiProviders'
import { registerAiIpc } from './ipc/ai'
import { registerQuickWriteIpc } from './ipc/quickWrite'
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

/**
 * Tells Electron (and therefore the renderer's `prefers-color-scheme`) which
 * color scheme to use. `auto` follows the OS; `dark`/`light` are forced.
 */
function applyTheme(theme: Theme) {
  nativeTheme.themeSource = theme === 'auto' ? 'system' : theme
}

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
    // Match the app background so there's no white flash when launching in dark mode.
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#020617' : '#f8fafc',
  })

  win.maximize()

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({
      mode: 'detach',
    })
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
  applyTheme(getConfig().theme)
  registerConfigIpc()
  registerAiProviderIpc()
  registerAiIpc()
  registerQuickWriteIpc()
  createApplicationMenu()
  createWindow()
})

// Config IPC: the Settings page may read everything but only change the
// non-hidden theme value. Hidden values are managed by app logic.
function registerConfigIpc() {
  ipcMain.handle('config:get', () => getConfig())

  ipcMain.handle('config:update', (_event, patch: unknown) => {
    const theme = (patch as { theme?: unknown } | null)?.theme
    if (theme !== 'auto' && theme !== 'dark' && theme !== 'light') {
      throw new Error('config:update only accepts a valid theme')
    }
    const config = updateConfig({ theme })
    applyTheme(config.theme)
    return config
  })
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
