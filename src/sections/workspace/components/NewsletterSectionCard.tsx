import { GripVertical, Trash2 } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import type { NewsletterSection } from '../types'
import { EventTagBadge } from './EventTagBadge'
import { NewsletterItemCard } from './NewsletterItemCard'

export interface NewsletterSectionCardProps {
  section: NewsletterSection
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
  isDragging?: boolean
  onEditSectionTitle?: (title: string) => void
  onDeleteSection?: () => void
  onEditItemTitle?: (itemId: string, title: string) => void
  onEditItemDescription?: (itemId: string, description: string) => void
  onEditItemBullet?: (itemId: string, bulletIndex: number, value: string) => void
  onAddItemBullet?: (itemId: string) => void
  onRemoveItemBullet?: (itemId: string, bulletIndex: number) => void
  onReplaceItemImage?: (itemId: string, imageUrl: string) => void
  onRemoveItemImage?: (itemId: string) => void
}

export function NewsletterSectionCard({
  section,
  dragHandleProps,
  isDragging = false,
  onEditSectionTitle,
  onDeleteSection,
  onEditItemTitle,
  onEditItemDescription,
  onEditItemBullet,
  onAddItemBullet,
  onRemoveItemBullet,
  onReplaceItemImage,
  onRemoveItemImage,
}: NewsletterSectionCardProps) {
  return (
    <section className={`group/section ${isDragging ? 'opacity-60' : ''}`}>
      <header className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400 transition-colors opacity-0 group-hover/section:opacity-100 touch-none"
          aria-label="Réordonner section (drag)"
          title="Glisser pour réordonner"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        <EventTagBadge tag={section.tag} />
        <input
          type="text"
          defaultValue={section.title}
          onBlur={(event) => {
            const next = event.currentTarget.value.trim()
            if (next && next !== section.title) onEditSectionTitle?.(next)
          }}
          className="flex-1 min-w-0 bg-transparent text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 rounded-sm px-1 -mx-1"
          aria-label="Titre de section"
        />
        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {section.items.length} {section.items.length > 1 ? 'items' : 'item'}
        </span>
        <button
          type="button"
          onClick={onDeleteSection}
          className="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors opacity-0 group-hover/section:opacity-100 focus:opacity-100"
          aria-label="Supprimer la section"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </header>

      <div className="space-y-3">
        {section.items.map((item) => (
          <NewsletterItemCard
            key={item.id}
            item={item}
            onEditTitle={(title) => onEditItemTitle?.(item.id, title)}
            onEditDescription={(description) => onEditItemDescription?.(item.id, description)}
            onEditBullet={(idx, value) => onEditItemBullet?.(item.id, idx, value)}
            onAddBullet={() => onAddItemBullet?.(item.id)}
            onRemoveBullet={(idx) => onRemoveItemBullet?.(item.id, idx)}
            onReplaceImage={(url) => onReplaceItemImage?.(item.id, url)}
            onRemoveImage={() => onRemoveItemImage?.(item.id)}
          />
        ))}
      </div>
    </section>
  )
}
