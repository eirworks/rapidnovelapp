/**
 * AI actions available in the Quick Write page. Each action maps to a system
 * instruction that is combined with the draft to build the chat prompt.
 */
export interface AiAction {
  id: string
  label: string
  description: string
  /** System instruction sent to the model along with the draft. */
  systemPrompt: string
}

export const AI_ACTIONS: AiAction[] = [
  {
    id: 'expand',
    label: 'Expand',
    description: 'Develop and extend the draft further.',
    systemPrompt:
      'You are a creative writing assistant. Expand the following draft, developing it further while preserving the existing style, tone, and point of view. Do not introduce contradictory facts. Return only the expanded text.',
  },
  {
    id: 'fix',
    label: 'Fix grammar & punctuation',
    description: 'Correct grammar, punctuation, and spelling.',
    systemPrompt:
      'You are an expert editor. Fix all grammar, punctuation, and spelling errors in the following draft while preserving the original meaning, style, and formatting. Return only the corrected text.',
  },
  {
    id: 'continue',
    label: 'Continue',
    description: 'Continue the story from where it ends.',
    systemPrompt:
      'You are a creative writing assistant. Continue the following draft naturally from where it ends, matching the existing style, tone, and point of view. Return only the continuation.',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Provide a short summary of the draft.',
    systemPrompt:
      'You are a concise writing assistant. Summarize the following draft in a few short sentences. Return only the summary.',
  },
]

export function getAiAction(id: string): AiAction | undefined {
  return AI_ACTIONS.find((a) => a.id === id)
}
