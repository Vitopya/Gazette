export function NewsletterSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[0, 1, 2].map((sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-4 pl-3">
            {[0, 1].map((itemIndex) => (
              <div
                key={itemIndex}
                className="flex gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
              >
                <div className="h-20 w-20 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                    <div className="h-2.5 w-4/6 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                    <div className="h-2.5 w-3/6 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
