import { Check, Code2, Copy, FileDown, RefreshCw } from 'lucide-react'
import type {
  Newsletter,
  NewsletterFormat,
  WorkspaceUiState,
} from '../types'
import { NewsletterSectionCard } from './NewsletterSectionCard'
import { NewsletterSkeleton } from './NewsletterSkeleton'

export interface NewsletterPanelProps {
  newsletter: Newsletter
  ui: WorkspaceUiState
  onCopyMarkdown?: () => void
  onCopyHtml?: () => void
  onRegenerate?: () => void
  onEditSectionTitle?: (sectionId: string, title: string) => void
  onDeleteSection?: (sectionId: string) => void
  onEditItemTitle?: (itemId: string, title: string) => void
  onEditItemDescription?: (itemId: string, description: string) => void
  onEditItemBullet?: (itemId: string, bulletIndex: number, value: string) => void
  onAddItemBullet?: (itemId: string) => void
  onRemoveItemBullet?: (itemId: string, bulletIndex: number) => void
  onReplaceItemImage?: (itemId: string, imageUrl: string) => void
  onRemoveItemImage?: (itemId: string) => void
}

function formatGeneratedDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CopyButton({
  format,
  label,
  icon: Icon,
  isLastCopied,
  onClick,
}: {
  format: NewsletterFormat
  label: string
  icon: typeof Copy
  isLastCopied: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
        isLastCopied
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800',
      ].join(' ')}
      aria-label={`Copier en ${label}`}
    >
      {isLastCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      <span className="hidden sm:inline">
        {isLastCopied ? `Copié ${format === 'markdown' ? 'MD' : 'HTML'}` : `Copier ${format === 'markdown' ? 'MD' : 'HTML'}`}
      </span>
    </button>
  )
}

export function NewsletterPanel({
  newsletter,
  ui,
  onCopyMarkdown,
  onCopyHtml,
  onRegenerate,
  onEditSectionTitle,
  onDeleteSection,
  onEditItemTitle,
  onEditItemDescription,
  onEditItemBullet,
  onAddItemBullet,
  onRemoveItemBullet,
  onReplaceItemImage,
  onRemoveItemImage,
}: NewsletterPanelProps) {
  const isGenerating = ui.isGenerating || newsletter.status === 'generating'
  const totalItems = newsletter.sections.reduce((sum, section) => sum + section.items.length, 0)
  const hasContent = newsletter.sections.length > 0

  return (
    <section
      aria-label="Newsletter générée"
      className="relative flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-950/40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rose-50/40 via-transparent to-transparent dark:from-rose-500/5"
      />

      <header className="relative px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Panneau droit · {newsletter.status === 'ready' ? 'Prête' : isGenerating ? 'En génération' : 'Brouillon'}
          </span>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {newsletter.title}
          </h2>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            Générée le {formatGeneratedDate(newsletter.generatedAt)} · {totalItems} item{totalItems > 1 ? 's' : ''} · {newsletter.sections.length} section{newsletter.sections.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton
            format="markdown"
            label="markdown"
            icon={FileDown}
            isLastCopied={ui.lastCopyFormat === 'markdown'}
            onClick={onCopyMarkdown}
          />
          <CopyButton
            format="html"
            label="HTML"
            icon={Code2}
            isLastCopied={ui.lastCopyFormat === 'html'}
            onClick={onCopyHtml}
          />
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="cursor-pointer inline-flex h-7 w-7 sm:h-auto sm:w-auto sm:px-2.5 sm:py-1.5 items-center justify-center gap-1.5 rounded-md bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Régénérer la newsletter"
            title="Régénérer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Régénérer</span>
          </button>
        </div>
      </header>

      <div className="relative flex-1 min-h-0 overflow-y-auto px-5 py-6 md:px-8 md:py-8">
        {isGenerating ? (
          <NewsletterSkeleton />
        ) : hasContent ? (
          <div className="space-y-10 max-w-3xl">
            {newsletter.sections.map((section) => (
              <NewsletterSectionCard
                key={section.id}
                section={section}
                onEditSectionTitle={(title) => onEditSectionTitle?.(section.id, title)}
                onDeleteSection={() => onDeleteSection?.(section.id)}
                onEditItemTitle={onEditItemTitle}
                onEditItemDescription={onEditItemDescription}
                onEditItemBullet={onEditItemBullet}
                onAddItemBullet={onAddItemBullet}
                onRemoveItemBullet={onRemoveItemBullet}
                onReplaceItemImage={onReplaceItemImage}
                onRemoveItemImage={onRemoveItemImage}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                <FileDown className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Aucune newsletter pour le moment
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Sélectionne des articles puis lance la génération depuis le panneau gauche.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
