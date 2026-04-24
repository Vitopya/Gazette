import { Check, ExternalLink } from 'lucide-react'
import type { Article, RssFeed } from '../types'

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

function formatRelative(isoDate: string) {
  const now = new Date()
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 60) return `il y a ${Math.max(1, minutes)} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 7) return `il y a ${days} j`
  return then.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export interface ArticleCardProps {
  article: Article
  feed?: RssFeed
  onToggleSelection?: (isSelected: boolean) => void
}

export function ArticleCard({ article, feed, onToggleSelection }: ArticleCardProps) {
  const accentDot = feed ? ACCENT_DOT_CLASSES[feed.accentColor] ?? 'bg-zinc-400' : 'bg-zinc-400'

  return (
    <label
      className={[
        'group relative flex gap-3 rounded-lg border p-2.5 cursor-pointer transition-all',
        article.isSelected
          ? 'border-sky-300 bg-sky-50/40 dark:border-sky-500/40 dark:bg-sky-500/5'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={article.isSelected}
        onChange={(event) => onToggleSelection?.(event.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={[
          'mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          article.isSelected
            ? 'bg-sky-500 border-sky-500 text-white'
            : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600',
        ].join(' ')}
      >
        {article.isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>

      {article.imageUrl && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          <img
            src={article.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} aria-hidden="true" />
          <span className="truncate text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {article.sourceName}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
            {formatRelative(article.publishedAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {article.title}
        </p>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
        aria-label={`Ouvrir l'article ${article.title} dans un nouvel onglet`}
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </label>
  )
}
