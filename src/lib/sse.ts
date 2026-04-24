export type SseEventHandler = (event: string, data: unknown) => void

export async function streamSse(
  url: string,
  init: RequestInit,
  onEvent: SseEventHandler,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(url, { ...init, signal })
  if (!response.ok || !response.body) {
    throw new Error(`SSE request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let separatorIndex = buffer.indexOf('\n\n')
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex)
      buffer = buffer.slice(separatorIndex + 2)
      separatorIndex = buffer.indexOf('\n\n')

      let eventName = 'message'
      const dataLines: string[] = []
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart())
        }
      }

      if (dataLines.length > 0) {
        const payload = dataLines.join('\n')
        try {
          onEvent(eventName, JSON.parse(payload))
        } catch {
          onEvent(eventName, payload)
        }
      }
    }
  }
}
