import { Loader2, Settings2, Sparkles } from 'lucide-react'
import type { Article, RssFeed, SearchFilters } from '../types'
import { ArticleCard } from './ArticleCard'
import { FilterControls } from './FilterControls'

export interface RssPanelProps {
  feeds: RssFeed[]
  filters: SearchFilters
  articles: Article[]
  isFetching: boolean
  isGenerating: boolean
  onOpenSettings?: () => void
  onUpdateFilters?: (next: Partial<SearchFilters>) => void
  onToggleFeedActive?: (feedId: string, isActive: boolean) => void
  onFetchArticles?: () => void
  onToggleArticleSelection?: (articleId: string, isSelected: boolean) => void
  onSelectAllArticles?: () => void
  onDeselectAllArticles?: () => void
  onGenerateNewsletter?: () => void
}

export function RssPanel({
  feeds,
  filters,
  articles,
  isFetching,
  isGenerating,
  onOpenSettings,
  onUpdateFilters,
  onToggleFeedActive,
  onFetchArticles,
  onToggleArticleSelection,
  onSelectAllArticles,
  onDeselectAllArticles,
  onGenerateNewsletter,
}: RssPanelProps) {
  const feedById = new Map(feeds.map((feed) => [feed.id, feed]))
  const selectedCount = articles.filter((article) => article.isSelected).length
  const hasArticles = articles.length > 0
  const hasSelection = selectedCount > 0

  return (
    <section
      aria-label="Sources RSS et filtres"
      className="flex h-full flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800"
    >
      <header className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Panneau gauche
          </span>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Sources et filtres
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Gérer les flux
        </button>
      </header>

      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
        <FilterControls
          feeds={feeds}
          filters={filters}
          onUpdateFilters={onUpdateFilters}
          onToggleFeedActive={onToggleFeedActive}
        />

        <button
          type="button"
          onClick={onFetchArticles}
          disabled={isFetching || filters.activeFeedIds.length === 0}
          className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-4 py-2.5 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sky-500"
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Recherche en cours…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Rechercher les articles
            </>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {hasArticles ? (
          <>
            <div className="px-5 py-2.5 flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800/60">
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{selectedCount}</span>
                <span className="text-zinc-400 dark:text-zinc-500"> / {articles.length} sélectionnés</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onSelectAllArticles}
                  className="cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Tout sélectionner
                </button>
                <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">
                  ·
                </span>
                <button
                  type="button"
                  onClick={onDeselectAllArticles}
                  className="cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Tout retirer
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  feed={feedById.get(article.feedId)}
                  onToggleSelection={(isSelected) => onToggleArticleSelection?.(article.id, isSelected)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-5 py-8">
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Lance une recherche pour récupérer les derniers articles de tes flux RSS.
            </p>
          </div>
        )}
      </div>

      {hasArticles && (
        <footer className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onGenerateNewsletter}
            disabled={!hasSelection || isGenerating}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm px-4 py-2.5 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Génération en cours…
              </>
            ) : (
              <>Générer la newsletter ({selectedCount})</>
            )}
          </button>
        </footer>
      )}
    </section>
  )
}
