import { LayoutPanelLeft, ListChecks } from 'lucide-react'
import type { ActivePanel, WorkspaceProps } from '../types'
import { NewsletterPanel } from './NewsletterPanel'
import { OnboardingCard } from './OnboardingCard'
import { RssPanel } from './RssPanel'

export function Workspace({
  feeds,
  filters,
  articles,
  newsletter,
  onboarding,
  ui,
  onOpenSettings,
  onChangeActivePanel,
  onAddFeed: _onAddFeed,
  onRemoveFeed: _onRemoveFeed,
  onToggleFeedActive,
  onUpdateFilters,
  onFetchArticles,
  onToggleArticleSelection,
  onSelectAllArticles,
  onDeselectAllArticles,
  onGenerateNewsletter,
  onRegenerateNewsletter,
  onEditSectionTitle,
  onReorderSections,
  onDeleteSection,
  onEditItemTitle,
  onEditItemDescription,
  onEditItemBullet,
  onAddItemBullet,
  onRemoveItemBullet,
  onReorderItemBullets: _onReorderItemBullets,
  onReplaceItemImage,
  onRemoveItemImage,
  onCopyMarkdown,
  onCopyHtml,
  onCompleteOnboardingStep,
}: WorkspaceProps) {
  if (!onboarding.completed) {
    return (
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 py-10 md:py-16 overflow-y-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_60%)]"
        />
        <OnboardingCard
          onboarding={onboarding}
          onCompleteStep={onCompleteOnboardingStep}
          onOpenSettings={onOpenSettings}
        />
      </div>
    )
  }

  const showRss = ui.activePanel === 'rss'
  const showNewsletter = ui.activePanel === 'newsletter'

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(320px,40%)_1fr]">
        <div className={`min-h-0 ${showRss ? 'flex' : 'hidden'} md:flex flex-col`}>
          <RssPanel
            feeds={feeds}
            filters={filters}
            articles={articles}
            isFetching={ui.isFetching}
            isGenerating={ui.isGenerating}
            onOpenSettings={onOpenSettings}
            onUpdateFilters={onUpdateFilters}
            onToggleFeedActive={onToggleFeedActive}
            onFetchArticles={onFetchArticles}
            onToggleArticleSelection={onToggleArticleSelection}
            onSelectAllArticles={onSelectAllArticles}
            onDeselectAllArticles={onDeselectAllArticles}
            onGenerateNewsletter={onGenerateNewsletter}
          />
        </div>
        <div className={`min-h-0 ${showNewsletter ? 'flex' : 'hidden'} md:flex flex-col`}>
          <NewsletterPanel
            newsletter={newsletter}
            ui={ui}
            onCopyMarkdown={onCopyMarkdown}
            onCopyHtml={onCopyHtml}
            onRegenerate={onRegenerateNewsletter}
            onReorderSections={onReorderSections}
            onEditSectionTitle={onEditSectionTitle}
            onDeleteSection={onDeleteSection}
            onEditItemTitle={onEditItemTitle}
            onEditItemDescription={onEditItemDescription}
            onEditItemBullet={onEditItemBullet}
            onAddItemBullet={onAddItemBullet}
            onRemoveItemBullet={onRemoveItemBullet}
            onReplaceItemImage={onReplaceItemImage}
            onRemoveItemImage={onRemoveItemImage}
          />
        </div>
      </div>

      <MobilePanelToggle activePanel={ui.activePanel} onChange={onChangeActivePanel} />
    </div>
  )
}

interface MobilePanelToggleProps {
  activePanel: ActivePanel
  onChange?: (panel: ActivePanel) => void
}

function MobilePanelToggle({ activePanel, onChange }: MobilePanelToggleProps) {
  return (
    <div className="md:hidden sticky bottom-0 z-20 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-2 flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange?.('rss')}
        className={[
          'cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
          activePanel === 'rss'
            ? 'bg-sky-500 text-white'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ].join(' ')}
        aria-pressed={activePanel === 'rss'}
      >
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        Sources
      </button>
      <button
        type="button"
        onClick={() => onChange?.('newsletter')}
        className={[
          'cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
          activePanel === 'newsletter'
            ? 'bg-rose-500 text-white'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ].join(' ')}
        aria-pressed={activePanel === 'newsletter'}
      >
        <LayoutPanelLeft className="h-4 w-4" aria-hidden="true" />
        Newsletter
      </button>
    </div>
  )
}
