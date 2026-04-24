// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/workspace
// -----------------------------------------------------------------------------

export type FeedAccentColor =
  | 'sky'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'violet'
  | 'cyan'
  | 'orange'
  | 'pink'

export interface RssFeed {
  id: string
  title: string
  url: string
  isActive: boolean
  accentColor: FeedAccentColor
  lastSyncedAt: string | null
}

export interface Article {
  id: string
  feedId: string
  title: string
  description: string
  url: string
  publishedAt: string
  imageUrl: string | null
  sourceName: string
  isSelected: boolean
}

export interface SearchFilters {
  dateFrom: string | null
  dateTo: string | null
  activeFeedIds: string[]
  keyword: string
  limit: number
}

export type NewsletterStatus = 'draft' | 'generating' | 'ready' | 'error'
export type NewsletterFormat = 'markdown' | 'html'
export type EventTag =
  | 'event'
  | 'raid'
  | 'update'
  | 'community'
  | 'research'
  | 'spotlight'
  | 'misc'

export interface NewsletterItem {
  id: string
  sourceArticleId: string
  title: string
  description: string
  imageUrl: string | null
  sourceUrl: string
  sourceName: string
  bullets: string[]
}

export interface NewsletterSection {
  id: string
  title: string
  tag: EventTag
  items: NewsletterItem[]
}

export interface Newsletter {
  id: string
  title: string
  generatedAt: string | null
  status: NewsletterStatus
  format: NewsletterFormat
  sections: NewsletterSection[]
}

export type OnboardingStepKey = 'api-key' | 'first-feed' | 'first-search'

export interface OnboardingStep {
  key: OnboardingStepKey
  title: string
  description: string
  completed: boolean
}

export interface OnboardingState {
  currentStep: 1 | 2 | 3
  completed: boolean
  steps: OnboardingStep[]
}

export type ActivePanel = 'rss' | 'newsletter'

export interface WorkspaceUiState {
  activePanel: ActivePanel
  isFetching: boolean
  isGenerating: boolean
  isSettingsOpen: boolean
  lastCopyFormat: NewsletterFormat | null
}
