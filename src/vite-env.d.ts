/// <reference types="vite/client" />

type Theme = 'auto' | 'dark' | 'light'

/** An AI provider (e.g. OpenAI, OpenRouter) the app can call. */
interface AiProvider {
  /** Stable identifier used by the app. */
  id: string
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
}

interface AppConfig {
  /** Hidden: managed internally by the app, not editable from Settings. */
  lastQuickWriteDir: string
  theme: Theme
  aiProviders: AiProvider[]
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
  configApi: {
    get(): Promise<AppConfig>
    update(patch: { theme?: Theme }): Promise<AppConfig>
    addAiProvider(input: Omit<AiProvider, 'id'>): Promise<AiProvider>
    updateAiProvider(provider: AiProvider): Promise<AiProvider>
    deleteAiProvider(id: string): Promise<void>
  }
  aiApi: {
    run(req: {
      providerId: string
      model: string
      systemPrompt: string
      text: string
    }): Promise<string>
  }
  quickWriteApi: {
    /**
     * Persists a serialized Quick Write document (DraftDocument JSON string).
     */
    save(content: string): Promise<{ path: string } | null>
    /**
     * Saves the combined item texts to a plain-text (.txt) file.
     */
    saveTxt(content: string): Promise<{ path: string } | null>
    /**
     * Loads a Quick Write file; `content` is the raw file text (structured JSON
     * for files created by this app, or plain text from older files).
     */
    load(): Promise<{ path: string; content: string } | null>
  }
}
