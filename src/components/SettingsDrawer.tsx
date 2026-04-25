import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, RotateCcw, Trash2, X, Wifi, WifiOff } from 'lucide-react'
import type { FeedAccentColor, RssFeed } from '../sections/workspace/types'

const ACCENT_OPTIONS: Array<{ value: FeedAccentColor; className: string }> = [
  { value: 'sky', className: 'bg-sky-500' },
  { value: 'rose', className: 'bg-rose-500' },
  { value: 'amber', className: 'bg-amber-500' },
  { value: 'emerald', className: 'bg-emerald-500' },
  { value: 'violet', className: 'bg-violet-500' },
  { value: 'cyan', className: 'bg-cyan-500' },
  { value: 'orange', className: 'bg-orange-500' },
  { value: 'pink', className: 'bg-pink-500' },
]

const ACCENT_DOT_CLASSES: Record<string, string> = Object.fromEntries(
  ACCENT_OPTIONS.map((opt) => [opt.value, opt.className]),
)

export type HealthStatus = 'unknown' | 'checking' | 'ok' | 'missing-key' | 'error'

export interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeds: RssFeed[]
  healthStatus: HealthStatus
  healthModel?: string
  onCheckHealth?: () => void
  onAddFeed: (input: { title: string; url: string; accentColor: FeedAccentColor }) => void
  onRemoveFeed: (feedId: string) => void
  onUpdateFeed: (feedId: string, patch: Partial<RssFeed>) => void
  onResetData: () => void
}

export function SettingsDrawer({
  open,
  onOpenChange,
  feeds,
  healthStatus,
  healthModel,
  onCheckHealth,
  onAddFeed,
  onRemoveFeed,
  onUpdateFeed,
  onResetData,
}: SettingsDrawerProps) {
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newAccent, setNewAccent] = useState<FeedAccentColor>('sky')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    if (!open) {
      setNewTitle('')
      setNewUrl('')
      setNewAccent('sky')
      setShowResetConfirm(false)
    }
  }, [open])

  function handleAddFeed(event: React.FormEvent) {
    event.preventDefault()
    const title = newTitle.trim()
    const url = newUrl.trim()
    if (!title || !url) return
    try {
      new URL(url)
    } catch {
      window.alert('URL invalide')
      return
    }
    onAddFeed({ title, url, accentColor: newAccent })
    setNewTitle('')
    setNewUrl('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right">
          <header className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Paramètres
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Flux RSS, état du proxy Claude et données locales.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Proxy Gemini
              </h3>
              <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3">
                {healthStatus === 'ok' ? (
                  <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {healthStatus === 'ok'
                      ? 'Proxy connecté'
                      : healthStatus === 'checking'
                        ? 'Vérification…'
                        : healthStatus === 'missing-key'
                          ? 'Clé API manquante côté serveur'
                          : healthStatus === 'error'
                            ? 'Erreur lors de la vérification'
                            : 'Non vérifié'}
                  </p>
                  {healthModel && (
                    <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      Modèle : {healthModel}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onCheckHealth}
                  className="cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Vérifier
                </button>
              </div>
              {healthStatus === 'missing-key' && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                  Définis <code className="font-mono">GEMINI_API_KEY</code> dans les variables
                  d'environnement Vercel ou dans <code className="font-mono">.env</code> en local.
                </p>
              )}
            </section>

            <section>
              <div className="flex items-baseline justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Flux RSS
                </h3>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {feeds.length} configuré{feeds.length > 1 ? 's' : ''}
                </span>
              </div>

              <ul className="mt-2 space-y-2">
                {feeds.map((feed) => (
                  <li
                    key={feed.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${ACCENT_DOT_CLASSES[feed.accentColor] ?? 'bg-zinc-400'}`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {feed.title}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {feed.url}
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={feed.isActive}
                        onChange={(event) =>
                          onUpdateFeed(feed.id, { isActive: event.target.checked })
                        }
                        className="cursor-pointer"
                      />
                      Actif
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveFeed(feed.id)}
                      className="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                      aria-label={`Supprimer ${feed.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <form
                onSubmit={handleAddFeed}
                className="mt-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-3 space-y-2"
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Titre du flux"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
                <input
                  type="url"
                  value={newUrl}
                  onChange={(event) => setNewUrl(event.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Couleur :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewAccent(opt.value)}
                        className={[
                          'cursor-pointer h-5 w-5 rounded-full transition-transform',
                          opt.className,
                          newAccent === opt.value
                            ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-950'
                            : 'opacity-70 hover:opacity-100',
                        ].join(' ')}
                        aria-label={opt.value}
                        aria-pressed={newAccent === opt.value}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-3 py-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Ajouter le flux
                </button>
              </form>
            </section>

            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Données locales
              </h3>
              {showResetConfirm ? (
                <div className="mt-2 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 p-3 space-y-2">
                  <p className="text-sm text-rose-800 dark:text-rose-200">
                    Cette action efface flux, filtres, brouillon de newsletter et progression
                    d'onboarding. Irréversible.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetData()
                        setShowResetConfirm(false)
                      }}
                      className="cursor-pointer flex-1 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5"
                    >
                      Confirmer la réinitialisation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-2 cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Réinitialiser les données locales
                </button>
              )}
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
