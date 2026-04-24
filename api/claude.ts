import type { IncomingMessage, ServerResponse } from 'http'
import Anthropic from '@anthropic-ai/sdk'

interface IncomingArticle {
  id: string
  title: string
  description?: string
  url: string
  publishedAt?: string
  imageUrl?: string | null
  sourceName?: string
}

interface RequestBody {
  articles: IncomingArticle[]
  newsletterTitle?: string
}

const SYSTEM_PROMPT = `Tu es l'éditeur de PokeWatch, un outil qui transforme des articles RSS Pokémon en newsletters structurées et synthétiques.

Tu reçois une liste d'articles RSS Pokémon. Pour chacun, tu dois :
1. Synthétiser un titre concis (différent de l'original, centré sur l'événement)
2. Une description en une phrase claire
3. 2 à 5 bulletpoints avec les infos clés (dates, contres, bonus, durée, etc.)
4. Conserver l'imageUrl, sourceUrl, sourceName et sourceArticleId tels quels

Classe chaque article dans UNE de ces catégories (EventTag) :
- "event"     : événement général, promotion, festival
- "raid"      : raid spécifique (Mewtwo, légendaires, formes Therian, etc.)
- "update"    : mise à jour app, version, changement de mécaniques
- "community" : Community Day
- "research"  : Recherche Spéciale, Field Research, Timed Research
- "spotlight" : Spotlight Hour
- "misc"      : tout le reste

Regroupe les items par tag en sections. Ordre de priorité d'affichage des sections (utilise cet ordre si présent) :
event, raid, community, spotlight, research, update, misc.

Style de rédaction : direct, précis, sans bruit, sans verbose. Utilise du français naturel et professionnel. Pas de superlatifs vides ("incroyable", "exceptionnel"). Reste factuel.

OUTPUT FORMAT — réponds UNIQUEMENT avec un bloc \`\`\`json contenant cet objet :

\`\`\`json
{
  "title": "PokeWatch — Hebdo du <DD MMM YYYY>",
  "sections": [
    {
      "title": "<titre de section en français>",
      "tag": "event|raid|update|community|research|spotlight|misc",
      "items": [
        {
          "title": "<titre concis>",
          "description": "<une phrase>",
          "bullets": ["<point 1>", "<point 2>"],
          "imageUrl": "<URL ou null>",
          "sourceUrl": "<URL>",
          "sourceName": "<nom de la source>",
          "sourceArticleId": "<id de l'article source>"
        }
      ]
    }
  ]
}
\`\`\`

Exemples de titres de section français :
- event → "Événements à venir"
- raid → "Raids légendaires"
- update → "Mises à jour et features"
- community → "Community Day"
- research → "Recherches"
- spotlight → "Spotlight Hours"
- misc → "Autres infos"

Aucun texte hors du bloc JSON.`

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured on the server')
  }
  return new Anthropic({ apiKey })
}

function formatArticlesForUser(articles: IncomingArticle[]): string {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const lines = articles.map((article, index) => {
    return [
      `## Article ${index + 1}`,
      `id: ${article.id}`,
      `source: ${article.sourceName ?? '?'}`,
      `url: ${article.url}`,
      `publishedAt: ${article.publishedAt ?? '?'}`,
      `imageUrl: ${article.imageUrl ?? 'null'}`,
      `title: ${article.title}`,
      `description: ${article.description ?? ''}`,
    ].join('\n')
  })
  return [
    `Date d'aujourd'hui : ${today}.`,
    '',
    `Voici ${articles.length} article${articles.length > 1 ? 's' : ''} à synthétiser dans la newsletter :`,
    '',
    lines.join('\n\n'),
    '',
    'Produis maintenant la newsletter au format JSON demandé.',
  ].join('\n')
}

function extractJsonBlock(text: string): string | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match?.[1]) return match[1].trim()
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null
  return text.slice(firstBrace, lastBrace + 1).trim()
}

interface ClaudeNewsletterItem {
  title: string
  description: string
  bullets: string[]
  imageUrl: string | null
  sourceUrl: string
  sourceName: string
  sourceArticleId: string
}

interface ClaudeNewsletterSection {
  title: string
  tag: string
  items: ClaudeNewsletterItem[]
}

interface ClaudeNewsletterPayload {
  title: string
  sections: ClaudeNewsletterSection[]
}

const VALID_TAGS = new Set([
  'event',
  'raid',
  'update',
  'community',
  'research',
  'spotlight',
  'misc',
])

function buildNewsletter(payload: ClaudeNewsletterPayload) {
  const generatedAt = new Date().toISOString()
  const newsletterId = `newsletter-${Date.now().toString(36)}`
  return {
    id: newsletterId,
    title: payload.title,
    generatedAt,
    status: 'ready' as const,
    format: 'markdown' as const,
    sections: payload.sections.map((section, sectionIndex) => ({
      id: `section-${sectionIndex}-${section.tag}`,
      title: section.title,
      tag: VALID_TAGS.has(section.tag) ? section.tag : 'misc',
      items: section.items.map((item, itemIndex) => ({
        id: `item-${sectionIndex}-${itemIndex}`,
        sourceArticleId: item.sourceArticleId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl ?? null,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        bullets: Array.isArray(item.bullets) ? item.bullets : [],
      })),
    })),
  }
}

export default async function handler(
  req: IncomingMessage & { body: unknown },
  res: ServerResponse,
) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const body = req.body as RequestBody | undefined
  if (!body || !Array.isArray(body.articles) || body.articles.length === 0) {
    res.statusCode = 400
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Body must include a non-empty articles array' }))
    return
  }

  res.statusCode = 200
  res.setHeader('content-type', 'text/event-stream')
  res.setHeader('cache-control', 'no-cache')
  res.setHeader('connection', 'keep-alive')
  ;(res as { flushHeaders?: () => void }).flushHeaders?.()

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const client = getAnthropicClient()
    const userPrompt = formatArticlesForUser(body.articles)
    const model = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

    send('start', { model, articleCount: body.articles.length })

    const stream = client.messages.stream({
      model,
      max_tokens: 8000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    let fullText = ''
    let charsSinceLastFlush = 0

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const chunk = event.delta.text
        fullText += chunk
        charsSinceLastFlush += chunk.length
        if (charsSinceLastFlush >= 32) {
          send('progress', { chars: fullText.length })
          charsSinceLastFlush = 0
        }
      }
    }

    const finalMessage = await stream.finalMessage()
    const jsonRaw = extractJsonBlock(fullText)
    if (!jsonRaw) {
      send('error', {
        message: 'Could not extract JSON from Claude output',
        raw: fullText.slice(0, 500),
      })
      res.end()
      return
    }

    let parsed: ClaudeNewsletterPayload
    try {
      parsed = JSON.parse(jsonRaw)
    } catch (e) {
      send('error', {
        message: `JSON parse failed: ${(e as Error).message}`,
        raw: jsonRaw.slice(0, 500),
      })
      res.end()
      return
    }

    const newsletter = buildNewsletter(parsed)

    send('complete', {
      newsletter,
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
        cacheCreationInputTokens:
          (finalMessage.usage as { cache_creation_input_tokens?: number })
            .cache_creation_input_tokens ?? 0,
        cacheReadInputTokens:
          (finalMessage.usage as { cache_read_input_tokens?: number })
            .cache_read_input_tokens ?? 0,
      },
    })
    res.end()
  } catch (error) {
    send('error', { message: String((error as Error).message ?? error) })
    res.end()
  }
}
