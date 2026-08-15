import { ipcRenderer, contextBridge } from 'electron'
import type { AppConfig, AiProvider, Theme } from '../config'

/** Lightweight project entry returned by the Load Project list. */
interface ProjectSummary {
  id: string
  name: string
  description: string | null
  author: string | null
  path: string
}

// --------- Expose config API to the Renderer process ---------
contextBridge.exposeInMainWorld('configApi', {
  get: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),
  update: (patch: { theme?: Theme }): Promise<AppConfig> =>
    ipcRenderer.invoke('config:update', patch),
  addAiProvider: (input: Omit<AiProvider, 'id'>): Promise<AiProvider> =>
    ipcRenderer.invoke('config:addAiProvider', input),
  updateAiProvider: (provider: AiProvider): Promise<AiProvider> =>
    ipcRenderer.invoke('config:updateAiProvider', provider),
  deleteAiProvider: (id: string): Promise<void> =>
    ipcRenderer.invoke('config:deleteAiProvider', id),
})

// --------- Expose AI run API to the Renderer process ---------
contextBridge.exposeInMainWorld('aiApi', {
  run: (req: {
    providerId: string
    model: string
    systemPrompt: string
    text: string
  }): Promise<string> => ipcRenderer.invoke('ai:run', req),
})

// --------- Expose Quick Write file API to the Renderer process ---------
contextBridge.exposeInMainWorld('quickWriteApi', {
  save: (content: string): Promise<{ path: string } | null> =>
    ipcRenderer.invoke('quickwrite:save', content),
  saveTxt: (content: string): Promise<{ path: string } | null> =>
    ipcRenderer.invoke('quickwrite:saveTxt', content),
  load: (): Promise<{ path: string; content: string } | null> =>
    ipcRenderer.invoke('quickwrite:load'),
})

// --------- Expose Project file API to the Renderer process ---------
contextBridge.exposeInMainWorld('projectApi', {
  save: (project: string): Promise<{ path: string }> =>
    ipcRenderer.invoke('project:save', project),
  list: (): Promise<ProjectSummary[]> => ipcRenderer.invoke('project:list'),
  load: (id: string): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('project:load', id),
})

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
