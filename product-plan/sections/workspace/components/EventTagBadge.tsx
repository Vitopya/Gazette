import type { EventTag } from '../types'

const TAG_LABELS: Record<EventTag, string> = {
  event: 'Événement',
  raid: 'Raid',
  update: 'Mise à jour',
  community: 'Community',
  research: 'Recherche',
  spotlight: 'Spotlight',
  misc: 'Divers',
}

const TAG_STYLES: Record<EventTag, string> = {
  event: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30',
  raid: 'bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30',
  update: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30',
  community: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30',
  research: 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30',
  spotlight: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-500/30',
  misc: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-500/30',
}

export interface EventTagBadgeProps {
  tag: EventTag
  className?: string
}

export function EventTagBadge({ tag, className = '' }: EventTagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset font-mono ${TAG_STYLES[tag]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {TAG_LABELS[tag]}
    </span>
  )
}
