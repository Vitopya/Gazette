import { useCallback, useEffect, useRef, useState } from 'react'
import { AppShell } from './shell/components/AppShell'
import { Workspace } from './sections/workspace/components/Workspace'
import { SettingsDrawer, type HealthStatus } from './components/SettingsDrawer'
import { useWorkspace } from './lib/useWorkspace'
import { fetchAllArticles } from './lib/rss-fetch'
import { generateNewsletter } from './lib/generate'
import { clearAllStorage } from './lib/storage'
import { copyHtmlToClipboard, copyMarkdownToClipboard } from './lib/serialize'
import {
  buildEmptyNewsletter,
  buildInitialFilters,
  buildInitialOnboarding,
  DEFAULT_FEEDS,
  INITIAL_UI,
} from './lib/initial-state'
import type { FeedAccentColor } from './sections/workspace/types'

const THEME_KEY = 'pokewatch:theme'

function readStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function newFeedId(): string {
  return `feed-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

export default function App() {
  const { state, dispatch } = useWorkspace()
  const [theme, setTheme] = useState<'light' | 'dark'>(readStoredTheme)
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('unknown')
  const [healthModel, setHealthModel] = useState<string | undefined>()
  const generationAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const checkHealth = useCallback(async () => {
    setHealthStatus('checking')
    try {
      const response = await fetch('/api/health')
      const data = (await response.json()) as { status: string; model?: string }
      setHealthModel(data.model)
      if (response.ok && data.status === 'ok') {
        setHealthStatus('ok')
        if (!state.onboarding.steps.find((s) => s.key === 'api-key')?.completed) {
          dispatch({ type: 'onboarding/complete-step', stepKey: 'api-key' })
        }
      } else {
        setHealthStatus(data.status === 'missing-key' ? 'missing-key' : 'error')
      }
    } catch {
      setHealthStatus('error')
    }
  }, [dispatch, state.onboarding.steps])

  useEffect(() => {
    void checkHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFetchArticles = useCallback(async () => {
    dispatch({ type: 'ui/set-fetching', value: true })
    try {
      const result = await fetchAllArticles(state.feeds, state.filters)
      dispatch({ type: 'articles/set', articles: result.articles })
      if (result.errors.length > 0) {
        console.warn('RSS fetch errors:', result.errors)
      }
      const firstFeedDone = state.onboarding.steps.find((s) => s.key === 'first-feed')?.completed
      if (state.feeds.length > 0 && !firstFeedDone) {
        dispatch({ type: 'onboarding/complete-step', stepKey: 'first-feed' })
      }
      const firstSearchDone = state.onboarding.steps.find((s) => s.key === 'first-search')
        ?.completed
      if (!firstSearchDone) {
        dispatch({ type: 'onboarding/complete-step', stepKey: 'first-search' })
      }
    } catch (error) {
      console.error('RSS fetch failed:', error)
      window.alert(`Erreur lors de la récupération des flux : ${(error as Error).message}`)
    } finally {
      dispatch({ type: 'ui/set-fetching', value: false })
    }
  }, [dispatch, state.feeds, state.filters, state.onboarding.steps])

  const handleGenerateNewsletter = useCallback(async () => {
    const selected = state.articles.filter((a) => a.isSelected)
    if (selected.length === 0) return

    generationAbortRef.current?.abort()
    const controller = new AbortController()
    generationAbortRef.current = controller

    dispatch({ type: 'ui/set-generating', value: true })
    try {
      const { newsletter } = await generateNewsletter({
        selectedArticles: selected,
        signal: controller.signal,
      })
      dispatch({ type: 'newsletter/set', newsletter })
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      console.error('Newsletter generation failed:', error)
      dispatch({ type: 'newsletter/status', status: 'error' })
      window.alert(`Erreur lors de la génération : ${(error as Error).message}`)
    } finally {
      dispatch({ type: 'ui/set-generating', value: false })
    }
  }, [dispatch, state.articles])

  const handleResetData = useCallback(() => {
    clearAllStorage()
    dispatch({
      type: 'state/reset',
      next: {
        feeds: DEFAULT_FEEDS,
        filters: buildInitialFilters(),
        articles: [],
        newsletter: buildEmptyNewsletter(),
        onboarding: buildInitialOnboarding(),
        ui: { ...INITIAL_UI, isSettingsOpen: false },
      },
    })
  }, [dispatch])

  const handleAddFeed = useCallback(
    (input: { title: string; url: string; accentColor: FeedAccentColor }) => {
      dispatch({
        type: 'feed/add',
        feed: {
          id: newFeedId(),
          title: input.title,
          url: input.url,
          isActive: true,
          accentColor: input.accentColor,
          lastSyncedAt: null,
        },
      })
      const firstFeedDone = state.onboarding.steps.find((s) => s.key === 'first-feed')?.completed
      if (!firstFeedDone) {
        dispatch({ type: 'onboarding/complete-step', stepKey: 'first-feed' })
      }
    },
    [dispatch, state.onboarding.steps],
  )

  const setSettingsOpen = useCallback(
    (open: boolean) => dispatch({ type: 'ui/set-settings-open', value: open }),
    [dispatch],
  )

  const copyResetTimeoutRef = useRef<number | null>(null)

  const triggerCopyFeedback = useCallback(
    (format: 'markdown' | 'html') => {
      dispatch({ type: 'ui/set-last-copy-format', format })
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current)
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'ui/set-last-copy-format', format: null })
        copyResetTimeoutRef.current = null
      }, 2500)
    },
    [dispatch],
  )

  const handleCopyMarkdown = useCallback(async () => {
    if (state.newsletter.sections.length === 0) return
    try {
      await copyMarkdownToClipboard(state.newsletter)
      triggerCopyFeedback('markdown')
    } catch (error) {
      console.error('Copy markdown failed:', error)
      window.alert(`Erreur lors de la copie : ${(error as Error).message}`)
    }
  }, [state.newsletter, triggerCopyFeedback])

  const handleCopyHtml = useCallback(async () => {
    if (state.newsletter.sections.length === 0) return
    try {
      await copyHtmlToClipboard(state.newsletter)
      triggerCopyFeedback('html')
    } catch (error) {
      console.error('Copy HTML failed:', error)
      window.alert(`Erreur lors de la copie : ${(error as Error).message}`)
    }
  }, [state.newsletter, triggerCopyFeedback])

  return (
    <>
      <AppShell
        user={{ name: 'Joseph Deffayet' }}
        theme={theme}
        onLogoClick={() => dispatch({ type: 'ui/set-active-panel', panel: 'rss' })}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onLogout={handleResetData}
      >
        <Workspace
          feeds={state.feeds}
          filters={state.filters}
          articles={state.articles}
          newsletter={state.newsletter}
          onboarding={state.onboarding}
          ui={state.ui}
          onOpenSettings={() => setSettingsOpen(true)}
          onChangeActivePanel={(panel) =>
            dispatch({ type: 'ui/set-active-panel', panel })
          }
          onAddFeed={(input) =>
            handleAddFeed({ title: input.title ?? 'Nouveau flux', url: input.url, accentColor: 'sky' })
          }
          onRemoveFeed={(feedId) => dispatch({ type: 'feed/remove', feedId })}
          onToggleFeedActive={(feedId, isActive) =>
            dispatch({ type: 'feed/toggle-active', feedId, isActive })
          }
          onUpdateFilters={(patch) => dispatch({ type: 'filters/update', patch })}
          onFetchArticles={handleFetchArticles}
          onToggleArticleSelection={(articleId, isSelected) =>
            dispatch({ type: 'articles/toggle-selection', articleId, isSelected })
          }
          onSelectAllArticles={() => dispatch({ type: 'articles/select-all' })}
          onDeselectAllArticles={() => dispatch({ type: 'articles/deselect-all' })}
          onGenerateNewsletter={handleGenerateNewsletter}
          onRegenerateNewsletter={handleGenerateNewsletter}
          onEditSectionTitle={(sectionId, title) =>
            dispatch({ type: 'section/edit-title', sectionId, title })
          }
          onReorderSections={(orderedIds) =>
            dispatch({ type: 'section/reorder', orderedIds })
          }
          onDeleteSection={(sectionId) => dispatch({ type: 'section/delete', sectionId })}
          onEditItemTitle={(itemId, title) =>
            dispatch({ type: 'item/edit-title', itemId, title })
          }
          onEditItemDescription={(itemId, description) =>
            dispatch({ type: 'item/edit-description', itemId, description })
          }
          onEditItemBullet={(itemId, bulletIndex, value) =>
            dispatch({ type: 'item/edit-bullet', itemId, bulletIndex, value })
          }
          onAddItemBullet={(itemId) => dispatch({ type: 'item/add-bullet', itemId })}
          onRemoveItemBullet={(itemId, bulletIndex) =>
            dispatch({ type: 'item/remove-bullet', itemId, bulletIndex })
          }
          onReorderItemBullets={(itemId, orderedBullets) =>
            dispatch({ type: 'item/reorder-bullets', itemId, orderedBullets })
          }
          onReplaceItemImage={(itemId, imageUrl) =>
            dispatch({ type: 'item/replace-image', itemId, imageUrl })
          }
          onRemoveItemImage={(itemId) => dispatch({ type: 'item/remove-image', itemId })}
          onCopyMarkdown={handleCopyMarkdown}
          onCopyHtml={handleCopyHtml}
          onCompleteOnboardingStep={(stepKey) =>
            dispatch({ type: 'onboarding/complete-step', stepKey })
          }
        />
      </AppShell>

      <SettingsDrawer
        open={state.ui.isSettingsOpen}
        onOpenChange={setSettingsOpen}
        feeds={state.feeds}
        healthStatus={healthStatus}
        healthModel={healthModel}
        onCheckHealth={checkHealth}
        onAddFeed={handleAddFeed}
        onRemoveFeed={(feedId) => dispatch({ type: 'feed/remove', feedId })}
        onUpdateFeed={(feedId, patch) => dispatch({ type: 'feed/update', feedId, patch })}
        onResetData={handleResetData}
      />
    </>
  )
}
