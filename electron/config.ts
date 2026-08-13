import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

export type Theme = 'auto' | 'dark' | 'light'

/** An AI provider (e.g. OpenAI, OpenRouter) the app can call. */
export interface AiProvider {
  /** Stable identifier used by the app. */
  id: string
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
}

export interface AppConfig {
  /** Hidden: managed internally by the app, not editable from the Settings page. */
  lastQuickWriteDir: string
  theme: Theme
  aiProviders: AiProvider[]
}

/** Shipped on first run — OpenRouter with empty credentials. */
export const DEFAULT_AI_PROVIDERS: AiProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    models: [],
  },
]

export const DEFAULT_CONFIG: AppConfig = {
  lastQuickWriteDir: '',
  theme: 'auto',
  aiProviders: DEFAULT_AI_PROVIDERS,
}

/** Deep-clones providers so callers never mutate the shared default. */
function cloneProviders(providers: AiProvider[]): AiProvider[] {
  return providers.map((p) => ({ ...p, models: [...p.models] }))
}

/** A fresh default config with a cloned provider list. */
function defaultConfig(): AppConfig {
  return { ...DEFAULT_CONFIG, aiProviders: cloneProviders(DEFAULT_AI_PROVIDERS) }
}

let configDir = ''
let configPath = ''

/** ~/.rapidnovel directory. Requires initConfig() to have run. */
export function getAppDir(): string {
  return configDir
}

/** ~/.rapidnovel/projects directory. Requires initConfig() to have run. */
export function getProjectsDir(): string {
  return path.join(configDir, 'projects')
}

/**
 * Creates ~/.rapidnovel (with config.json and the projects/ dir) on first run.
 * Idempotent — safe to call on every launch.
 */
export function initConfig(): void {
  configDir = path.join(app.getPath('home'), '.rapidnovel')
  configPath = path.join(configDir, 'config.json')

  fs.mkdirSync(configDir, { recursive: true })
  fs.mkdirSync(getProjectsDir(), { recursive: true })

  if (!fs.existsSync(configPath)) {
    writeConfig(DEFAULT_CONFIG)
  }
}

/** Reads the current config, falling back to defaults on missing/corrupt file. */
export function getConfig(): AppConfig {
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      ...defaultConfig(),
      ...parsed,
      aiProviders: cloneProviders(parsed.aiProviders ?? DEFAULT_AI_PROVIDERS),
    }
  } catch {
    return defaultConfig()
  }
}

/** Full-access update (main process only). Persists and returns the new config. */
export function updateConfig(patch: Partial<AppConfig>): AppConfig {
  const next = { ...getConfig(), ...patch }
  writeConfig(next)
  return next
}

/** Hidden value setter — used by Quick Write once it picks a directory. */
export function setLastQuickWriteDir(dir: string): AppConfig {
  return updateConfig({ lastQuickWriteDir: dir })
}

function writeConfig(config: AppConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}
