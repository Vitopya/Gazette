import { useState } from 'react'
import { ImageOff, ImagePlus, Plus, X } from 'lucide-react'
import type { NewsletterItem } from '../types'
import { RichTextEditor } from '../../../components/RichTextEditor'

export interface NewsletterItemCardProps {
  item: NewsletterItem
  onEditTitle?: (title: string) => void
  onEditDescription?: (description: string) => void
  onEditBullet?: (bulletIndex: number, value: string) => void
  onAddBullet?: () => void
  onRemoveBullet?: (bulletIndex: number) => void
  onReplaceImage?: (imageUrl: string) => void
  onRemoveImage?: () => void
}

export function NewsletterItemCard({
  item,
  onEditTitle,
  onEditDescription,
  onEditBullet,
  onAddBullet,
  onRemoveBullet,
  onReplaceImage,
  onRemoveImage,
}: NewsletterItemCardProps) {
  const [showImageMenu, setShowImageMenu] = useState(false)

  function handleReplaceImage() {
    setShowImageMenu(false)
    const next = window.prompt("URL de l'image", item.imageUrl ?? '')
    if (next && next !== item.imageUrl) {
      onReplaceImage?.(next)
    }
  }

  return (
    <article className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-shadow hover:shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative h-32 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-600">
              <ImageOff className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-x-1 bottom-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setShowImageMenu((prev) => !prev)}
              className="cursor-pointer inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900/80 text-white text-xs hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label="Options de l'image"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          {showImageMenu && (
            <div className="absolute bottom-8 right-1 z-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={handleReplaceImage}
                className="cursor-pointer block w-full px-3 py-1.5 text-left text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                Remplacer
              </button>
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false)
                    onRemoveImage?.()
                  }}
                  className="cursor-pointer block w-full px-3 py-1.5 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  Retirer
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            defaultValue={item.title}
            onBlur={(event) => {
              const next = event.currentTarget.value.trim()
              if (next && next !== item.title) onEditTitle?.(next)
            }}
            className="w-full bg-transparent text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 rounded-sm px-1 -mx-1"
            aria-label="Titre de l'item"
          />
          <div className="mt-1 -mx-1 rounded-sm px-1 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-zinc-900">
            <RichTextEditor
              defaultText={item.description}
              onSave={(next) => onEditDescription?.(next)}
              placeholder="Décris l'événement…"
              ariaLabel="Description de l'item"
              className="text-sm text-zinc-600 dark:text-zinc-300 min-h-[1.5rem]"
            />
          </div>

          <ul className="mt-2 space-y-1">
            {item.bullets.map((bullet, index) => (
              <li key={index} className="group/bullet flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />
                <div className="flex-1 -mx-1 rounded-sm px-1 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-zinc-900">
                  <RichTextEditor
                    defaultText={bullet}
                    onSave={(next) => onEditBullet?.(index, next)}
                    placeholder="Détail clé…"
                    ariaLabel={`Bullet ${index + 1}`}
                    className="text-sm text-zinc-700 dark:text-zinc-200"
                    singleLine
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBullet?.(index)}
                  className="cursor-pointer inline-flex h-5 w-5 items-center justify-center rounded text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-zinc-600 dark:hover:text-rose-400 transition-colors opacity-0 group-hover/bullet:opacity-100"
                  aria-label={`Supprimer bullet ${index + 1}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onAddBullet}
                className="cursor-pointer inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-sky-600 dark:text-zinc-500 dark:hover:text-sky-400 transition-colors"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                Ajouter un point
              </button>
            </li>
          </ul>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            <span>Source :</span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline hover:text-sky-600 dark:hover:text-sky-400 truncate"
            >
              {item.sourceName}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
