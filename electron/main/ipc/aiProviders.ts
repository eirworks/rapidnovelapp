import { ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { getConfig, updateConfig, type AiProvider } from '../../config'

/**
 * Registers the AI-provider IPC handlers.
 * The Settings page may add, update, and delete providers.
 */
export function registerAiProviderIpc(): void {
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
