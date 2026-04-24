# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Or via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

## Font Usage

- **Headings & body:** Plus Jakarta Sans — geometric, modern, friendly. Same font for headings and body keeps the system simple.
- **Code / micro-labels / timestamps:** JetBrains Mono — used for uppercase tracking-widest labels (panneau gauche/droit, étape 1/2/3), relative dates, source URLs. Adds technical character without disrupting readability.

## Apply Globally

```css
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

code, pre, .font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
```

Tailwind utilities `font-sans` and `font-mono` map to these via the project's CSS configuration. Components in this export use `font-mono` directly on micro-labels (see `EventTagBadge.tsx`, `ArticleCard.tsx`).

## Weight Reference

- **300 (light)** — rarely used
- **400 (regular)** — body text
- **500 (medium)** — emphasis, button labels
- **600 (semibold)** — section headings, item titles
- **700 (bold)** — major headings, item card titles
- **800 (extrabold)** — onboarding hero heading
