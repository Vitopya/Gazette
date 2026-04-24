import { streamSse } from './sse'
import type { Article, Newsletter } from '../sections/workspace/types'

export interface GenerateProgressEvent {
  type: 'start' | 'progress' | 'complete' | 'error'
  data: unknown
}

export interface GenerateOptions {
  selectedArticles: Article[]
  signal?: AbortSignal
  onProgress?: (event: GenerateProgressEvent) => void
}

export async function generateNewsletter(
  options: GenerateOptions,
): Promise<{ newsletter: Newsletter; usage?: Record<string, number> }> {
  const { selectedArticles, signal, onProgress } = options

  let resolved: Newsletter | null = null
  let usage: Record<string, number> | undefined
  let errorMessage: string | null = null

  await streamSse(
    '/api/claude',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ articles: selectedArticles }),
    },
    (event, data) => {
      onProgress?.({ type: event as GenerateProgressEvent['type'], data })
      if (event === 'complete') {
        const payload = data as { newsletter: Newsletter; usage?: Record<string, number> }
        resolved = payload.newsletter
        usage = payload.usage
      } else if (event === 'error') {
        errorMessage = (data as { message?: string }).message ?? 'unknown error'
      }
    },
    signal,
  )

  if (errorMessage) {
    throw new Error(errorMessage)
  }
  if (!resolved) {
    throw new Error('Stream ended without a complete event')
  }
  return { newsletter: resolved, usage }
}
