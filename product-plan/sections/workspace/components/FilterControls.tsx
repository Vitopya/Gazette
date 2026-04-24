import type { RssFeed, SearchFilters } from '../types'
import { Calendar, Hash, Search } from 'lucide-react'

const ACCENT_DOT_CLASSES: Record<string, string> = {
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
}

export interface FilterControlsProps {
  feeds: RssFeed[]
  filters: SearchFilters
  onUpdateFilters?: (next: Partial<SearchFilters>) => void
  onToggleFeedActive?: (feedId: string, isActive: boolean) => void
}

export function FilterControls({
  feeds,
  filters,
  onUpdateFilters,
  onToggleFeedActive,
}: FilterControlsProps) {
  const activeFeeds = feeds.filter((feed) => feed.isActive)
  const isFeedSelected = (feedId: string) => filters.activeFeedIds.includes(feedId)

  function handleFeedToggle(feedId: string) {
    const isCurrentlySelected = isFeedSelected(feedId)
    const next = isCurrentlySelected
      ? filters.activeFeedIds.filter((id) => id !== feedId)
      : [...filters.activeFeedIds, feedId]
    onUpdateFilters?.({ activeFeedIds: next })
    onToggleFeedActive?.(feedId, !isCurrentlySelected)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Du
          </span>
          <div className="mt-1 relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => onUpdateFilters?.({ dateFrom: event.target.value || null })}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-7 pr-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Au
          </span>
          <div className="mt-1 relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => onUpdateFilters?.({ dateTo: event.target.value || null })}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-7 pr-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </label>
      </div>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Sources actives
        </span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {activeFeeds.length === 0 ? (
            <p className="text-xs italic text-zinc-400 dark:text-zinc-500">
              Aucun flux activé. Gère tes flux dans les paramètres.
            </p>
          ) : (
            activeFeeds.map((feed) => {
              const selected = isFeedSelected(feed.id)
              return (
                <button
                  key={feed.id}
                  type="button"
                  onClick={() => handleFeedToggle(feed.id)}
                  className={[
                    'cursor-pointer inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                    selected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT_CLASSES[feed.accentColor] ?? 'bg-zinc-400'}`}
                    aria-hidden="true"
                  />
                  {feed.title}
                </button>
              )
            })
          )}
        </div>
      </div>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Mot-clé
        </span>
        <div className="mt-1 relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onUpdateFilters?.({ keyword: event.target.value })}
            placeholder="raid, community day, mewtwo…"
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </label>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Limite
        </span>
        <div className="mt-1 relative">
          <Hash className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <input
            type="number"
            min={1}
            max={100}
            value={filters.limit}
            onChange={(event) => onUpdateFilters?.({ limit: Math.max(1, Number(event.target.value) || 1) })}
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </label>
    </div>
  )
}
