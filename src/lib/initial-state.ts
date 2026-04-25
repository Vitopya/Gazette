import type {
  Article,
  Newsletter,
  OnboardingState,
  RssFeed,
  SearchFilters,
  WorkspaceUiState,
} from '../sections/workspace/types'

export const DEFAULT_FEEDS: RssFeed[] = [
  {
    id: 'feed-pkmn-go-hub',
    title: 'Pokémon GO Hub',
    url: 'https://pokemongohub.net/feed/',
    isActive: true,
    accentColor: 'sky',
    lastSyncedAt: null,
  },
  {
    id: 'feed-leekduck',
    title: 'LeekDuck',
    url: 'https://leekduck.com/rss/news.xml',
    isActive: true,
    accentColor: 'rose',
    lastSyncedAt: null,
  },
]

export function buildInitialFilters(): SearchFilters {
  const now = new Date()
  const past = new Date(now)
  past.setDate(now.getDate() - 7)
  return {
    dateFrom: past.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
    activeFeedIds: DEFAULT_FEEDS.filter((f) => f.isActive).map((f) => f.id),
    keyword: '',
    limit: 25,
  }
}

export const INITIAL_ARTICLES: Article[] = []

export function buildEmptyNewsletter(): Newsletter {
  return {
    id: 'newsletter-draft',
    title: 'Newsletter PokeWatch',
    generatedAt: null,
    status: 'draft',
    format: 'markdown',
    sections: [],
  }
}

export function buildInitialOnboarding(): OnboardingState {
  return {
    currentStep: 1,
    completed: false,
    steps: [
      {
        key: 'api-key',
        title: 'Activer le proxy Gemini',
        description:
          "Vérifie que la variable d'environnement GEMINI_API_KEY est configurée côté serveur.",
        completed: false,
      },
      {
        key: 'first-feed',
        title: 'Vérifier les flux RSS',
        description:
          'Pokémon GO Hub et LeekDuck sont configurés par défaut. Ouvre les paramètres pour ajuster.',
        completed: false,
      },
      {
        key: 'first-search',
        title: 'Lancer une première recherche',
        description: 'Configure tes filtres et clique sur Rechercher pour récupérer les articles.',
        completed: false,
      },
    ],
  }
}

export const INITIAL_UI: WorkspaceUiState = {
  activePanel: 'rss',
  isFetching: false,
  isGenerating: false,
  isSettingsOpen: false,
  lastCopyFormat: null,
}
