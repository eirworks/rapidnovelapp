import { ipcMain } from 'electron'
import OpenAI from 'openai'
import { getConfig } from '../../config'

interface AiRunRequest {
  providerId: string
  model: string
  systemPrompt: string
  text: string
}

/**
 * Registers the `ai:run` handler, which sends a chat completion through the
 * selected AI provider. The provider's apiKey/baseUrl are resolved here in the
 * main process (not trusted from the renderer).
 */
export function registerAiIpc(): void {
  ipcMain.handle('ai:run', async (_event, input: unknown): Promise<string> => {
    const req = sanitizeRunRequest(input)
    const config = getConfig()
    const provider = config.aiProviders.find((p) => p.id === req.providerId)
    if (!provider) throw new Error('Selected provider was not found')
    if (!provider.apiKey) throw new Error('Selected provider has no API key set')

    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl || undefined,
    })

    const completion = await client.chat.completions.create({
      model: req.model,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.text },
      ],
    })

    const content = completion.choices?.[0]?.message?.content ?? ''
    if (!content.trim()) throw new Error('The model returned an empty response')
    return content.trim()
  })
}

function sanitizeRunRequest(input: unknown): AiRunRequest {
  const raw =
    (typeof input === 'object' && input !== null ? input : {}) as Record<
      string,
      unknown
    >

  const providerId = typeof raw.providerId === 'string' ? raw.providerId : ''
  const model = typeof raw.model === 'string' ? raw.model.trim() : ''
  const systemPrompt = typeof raw.systemPrompt === 'string' ? raw.systemPrompt : ''
  const text = typeof raw.text === 'string' ? raw.text : ''

  if (!providerId) throw new Error('Provider is required')
  if (!model) throw new Error('A model must be selected')
  if (!text.trim()) throw new Error('The draft is empty')

  return { providerId, model, systemPrompt, text }
}
