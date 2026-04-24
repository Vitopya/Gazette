import type { IncomingMessage, ServerResponse } from 'http'

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)
  const model = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

  res.statusCode = hasKey ? 200 : 503
  res.setHeader('content-type', 'application/json')
  res.end(
    JSON.stringify({
      status: hasKey ? 'ok' : 'missing-key',
      model,
      hasAnthropicKey: hasKey,
    }),
  )
}
