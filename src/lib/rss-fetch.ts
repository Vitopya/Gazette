import type { Article, RssFeed, SearchFilters } from '../sections/workspace/types'

export async function fetchFeedArticles(feed: RssFeed): Promise<Article[]> {
  const params = new URLSearchParams({
    url: feed.url,
    feedId: feed.id,
    sourceName: feed.title,
  })
  const response = await fetch(`/api/rss?${params.toString()}`)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Fetch ${feed.title} failed (${response.status}): ${text}`)
  }
  const data = (await response.json()) as { articles: Article[] }
  return data.articles ?? []
}

export interface FetchAllResult {
  articles: Article[]
  errors: Array<{ feedId: string; message: string }>
}

export async function fetchAllArticles(
  feeds: RssFeed[],
  filters: SearchFilters,
): Promise<FetchAllResult> {
  const targetFeeds = feeds.filter(
    (f) => f.isActive && filters.activeFeedIds.includes(f.id),
  )

  const settled = await Promise.allSettled(targetFeeds.map(fetchFeedArticles))

  const errors: FetchAllResult['errors'] = []
  const fetched: Article[] = []
  settled.forEach((result, index) => {
    const feed = targetFeeds[index]
    if (result.status === 'fulfilled') {
      fetched.push(...result.value)
    } else {
      errors.push({ feedId: feed.id, message: String(result.reason) })
    }
  })

  return { articles: applyFilters(fetched, filters), errors }
}

function applyFilters(articles: Article[], filters: SearchFilters): Article[] {
  const { dateFrom, dateTo, keyword, limit } = filters
  const fromTs = dateFrom ? Date.parse(`${dateFrom}T00:00:00Z`) : null
  const toTs = dateTo ? Date.parse(`${dateTo}T23:59:59Z`) : null
  const keywordLower = keyword.trim().toLowerCase()

  const filtered = articles.filter((article) => {
    const ts = Date.parse(article.publishedAt)
    if (Number.isFinite(ts)) {
      if (fromTs && ts < fromTs) return false
      if (toTs && ts > toTs) return false
    }
    if (keywordLower) {
      const haystack = `${article.title} ${article.description}`.toLowerCase()
      if (!haystack.includes(keywordLower)) return false
    }
    return true
  })

  const seen = new Set<string>()
  const deduped = filtered.filter((article) => {
    const key = article.url || article.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  deduped.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

  return deduped.slice(0, Math.max(1, limit))
}
