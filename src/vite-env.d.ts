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

/** Lightweight draft entry returned by the Drafts list. */
interface DraftSummary {
  id: string
  title: string
  storyId: string | null
  updatedAt: string
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
  projectApi: {
    /**
     * Persists a project snapshot to
     * `~/.rapidnovel/project/<project-id>/project.json`.
     * `project` is the pre-serialized JSON string.
     */
    save(project: string): Promise<{ path: string }>
    /** Lists all saved projects, read from `~/.rapidnovel/project/<id>/project.json`. */
    list(): Promise<import('./libs/models/ProjectData').ProjectSummary[]>
    /** Loads the full saved data of a project by id. */
    load(id: string): Promise<import('./libs/models/ProjectData').ProjectData>
  }
  draftApi: {
    /** Lists every draft of a project from its `drafts/` directory. */
    list(projectId: string): Promise<DraftSummary[]>
    /** Loads a draft file; `content` is the raw DraftDocument JSON string. */
    load(projectId: string, draftId: string): Promise<{ content: string }>
    /** Writes a draft to `drafts/<draftId>.json` (creates the dir as needed). */
    save(projectId: string, draftId: string, content: string): Promise<{ path: string }>
    /** Deletes a draft file. */
    delete(projectId: string, draftId: string): Promise<void>
  }
}
