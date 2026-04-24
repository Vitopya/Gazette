import { ArrowRight, Check, KeyRound, Rss, Search } from 'lucide-react'
import type { OnboardingState, OnboardingStepKey } from '../types'

const STEP_ICONS: Record<OnboardingStepKey, typeof KeyRound> = {
  'api-key': KeyRound,
  'first-feed': Rss,
  'first-search': Search,
}

export interface OnboardingCardProps {
  onboarding: OnboardingState
  onCompleteStep?: (stepKey: OnboardingStepKey) => void
  onOpenSettings?: () => void
}

export function OnboardingCard({ onboarding, onCompleteStep, onOpenSettings }: OnboardingCardProps) {
  const totalSteps = onboarding.steps.length
  const completedCount = onboarding.steps.filter((s) => s.completed).length
  const progressPct = Math.round((completedCount / totalSteps) * 100)

  function handleStepClick(stepKey: OnboardingStepKey) {
    if (stepKey === 'first-search') {
      onCompleteStep?.(stepKey)
    } else {
      onOpenSettings?.()
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-50 via-transparent to-transparent dark:from-sky-500/10"
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Bienvenue
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-sky-300 to-transparent dark:from-sky-500/40" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Trois étapes pour ta première newsletter
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Configure tes accès, ajoute tes flux RSS, lance ta première recherche.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {completedCount}/{totalSteps}
          </span>
        </div>

        <ol className="mt-6 space-y-3">
          {onboarding.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.key]
            const isActive = !step.completed && index === completedCount
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step.key)}
                  disabled={step.completed}
                  className={[
                    'group w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                    step.completed
                      ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5 cursor-default'
                      : isActive
                        ? 'border-sky-300 bg-sky-50/80 dark:border-sky-500/40 dark:bg-sky-500/10 cursor-pointer hover:border-sky-400 dark:hover:border-sky-400'
                        : 'border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                      step.completed
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-sky-500 text-white'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700',
                    ].join(' ')}
                  >
                    {step.completed ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Étape {index + 1}
                      </span>
                    </span>
                    <span className="block font-semibold text-zinc-900 dark:text-zinc-50">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">
                      {step.description}
                    </span>
                  </span>
                  {!step.completed && (
                    <ArrowRight
                      className={[
                        'h-4 w-4 shrink-0 transition-transform',
                        isActive ? 'text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5' : 'text-zinc-400',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
