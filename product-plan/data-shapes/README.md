# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

- **RssFeed** — A configured RSS source (URL, title, isActive, accentColor, lastSyncedAt). Used in: workspace.
- **Article** — An RSS-fetched article candidate for the newsletter (title, description, url, publishedAt, imageUrl, source, isSelected). Used in: workspace.
- **SearchFilters** — Search criteria (dateFrom, dateTo, activeFeedIds, keyword, limit). Used in: workspace.
- **Newsletter** — Generated newsletter document (title, generatedAt, status, format, sections). Used in: workspace.
- **NewsletterSection** — Group of items by event tag (Raids, Events, Updates…). Used in: workspace.
- **NewsletterItem** — A single rendered event (title, description, bullets, imageUrl, source). Used in: workspace.
- **OnboardingStep / OnboardingState** — First-launch tutorial progression. Used in: workspace.
- **EventTag** — Union type for event categorization (`event | raid | update | community | research | spotlight | misc`). Used in: workspace.

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions:

- `sections/workspace/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.
