---
name: frontend-design
description: >-
  Create distinctive, production-grade frontend interfaces with high design
  quality. Use when the user asks to build web components, pages, or
  applications and wants visually striking, polished results that avoid generic
  AI aesthetics.
metadata:
  author: Quintessential
  version: '3.0.0'
---

# Frontend Design

Generate creative, production-grade frontend code with exceptional aesthetic quality. Every interface should feel intentionally designed — not templated.

## Design Thinking

Before coding, commit to a clear direction:

- **Purpose**: What problem does this solve? Who uses it?
- **Tone**: Pick a strong aesthetic — brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, soft/pastel, industrial, etc. Use these as inspiration but design something true to the chosen direction.
- **Differentiation**: What makes this unforgettable? What's the one thing someone remembers?

**Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.** Match implementation complexity to the vision: maximalist designs need elaborate effects; minimal designs need precision in spacing, typography, and subtle details.

## Aesthetics Guidelines

### Typography

Choose what the user wants first.

**Load fonts via `next/font`** — never from raw `<link>` tags or `@import` in CSS. For fonts not available through the Google Fonts API (e.g. Google Sans), download the files and use `next/font/local`:

```tsx
import localFont from 'next/font/local';

const googleSans = localFont({
  src: [
    { path: '../fonts/GoogleSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/GoogleSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/GoogleSans-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-google-sans',
  display: 'swap',
});
```

**Critical: CSS variable scoping.** The font variable class is applied on `<body>` via `className`. In Tailwind v4, `@theme inline` maps theme tokens to CSS variables. If you apply `font-sans` on `html`, it cannot read a variable set on `body` (CSS variables don't flow upward). Always apply `font-sans` on `body`, not `html`:

```css
/* globals.css — WRONG */
html {
  @apply font-sans;
}

/* globals.css — CORRECT */
body {
  @apply font-sans;
}
```

In the `@theme inline` block, use a distinct variable name to avoid circular references:

```css
@theme inline {
  --font-sans: var(--font-google-sans);
}
```

Never default to Inter, Roboto, Arial, or system fonts. Never converge on the same font (e.g. Space Grotesk) across designs. Every project gets a unique pairing.

### Color & Theme

Commit to a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**Define CSS variables in `globals.css`**, wire them through `tailwind.config.js`, and use the resulting Tailwind utilities:

```css
/* globals.css */
:root {
  --color-surface: #0a0a0a;
  --color-primary: #e4ff1a;
  --color-muted: #71717a;
}
```

```js
/* tailwind.config.js */
colors: {
  surface: 'var(--color-surface)',
  primary: 'var(--color-primary)',
  muted: 'var(--color-muted)',
}
```

Then use `bg-surface`, `text-primary`, `border-muted` etc. in components. Never use raw `var()` in inline styles when a Tailwind utility can express it.

Vary between light and dark themes across designs. Avoid cliched schemes (especially purple gradients on white).

### Motion & Interaction

Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

- **CSS-first**: Use CSS transitions and `animation-delay` for staggered reveals, hover states, scroll-triggered effects
- **Motion library** (Framer Motion / Motion): Use for complex orchestration in React when CSS alone falls short
- Surprise with scroll-triggered animations and hover states that feel tactile

### Spatial Composition

Break predictable layouts. Use asymmetry, overlap, diagonal flow, grid-breaking elements, generous negative space OR controlled density — whatever serves the aesthetic.

### Backgrounds & Texture

Create atmosphere. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays, decorative borders — choose what fits the tone. Never default to flat solid-color backgrounds when the design calls for depth.

## Project Integration Rules

These rules ensure the skill's creative output integrates cleanly with existing project architecture.

### Styling: Tailwind + `cn()`

All styling goes through Tailwind utilities. Use the project's `cn()` helper for conditional classes:

```tsx
import { cn } from '@/lib/utils';

export function Card({ variant, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 backdrop-blur-sm',
        variant === 'elevated' && 'shadow-2xl shadow-primary/20',
        variant === 'flat' && 'bg-surface/50',
        className
      )}
      {...props}
    />
  );
}
```

Reach for raw CSS (in `globals.css`) only when Tailwind cannot express the effect — complex gradients, `@keyframes`, noise SVG filters, or pseudo-element tricks. Keep raw CSS minimal and co-located in globals, not scattered in component files.

### Avoid Inline Styles

```tsx
// BAD
<div style={{ background: 'var(--color-surface)', marginTop: 20 }}>

// GOOD
<div className="bg-surface mt-5">
```

### Client / Server Boundary

Components are server components by default. Only add `'use client'` for components that need interactivity (hooks, event handlers, browser APIs).

Push `'use client'` to the **lowest leaf** that actually needs it. A page with a hero animation should look like:

```
page.tsx           → server component (fetches data, renders layout)
  HeroSection.tsx  → server component (static markup + Tailwind animations)
  HeroActions.tsx  → 'use client' (interactive buttons, hover effects needing JS)
```

If an effect can be achieved with pure CSS (`transition`, `animation`, `@keyframes`, `:hover`), keep the component as a server component.

### Component Structure

- Place components in `components/[feature]/` following the project's feature-based organization
- Aim for <200 lines per component — extract sub-components for complex layouts
- One component per file (small helpers co-located are fine)
- Use PascalCase for component files, kebab-case for directories

### Shared UI Library

Check if the project has a shared UI library (`@your-org/ui` or similar) before creating new base components. Use existing shared components as foundations and customize via `className` overrides, composition, or variant props. Only create new components in `components/ui/` when the shared library doesn't cover the need.

### Scrollbar Stability

Use `overflow-y: scroll` on the main scrollable container so the scrollbar always reserves its space — no layout shift when content changes between overflowing and not. Pair with global CSS that makes the scrollbar invisible by default (transparent track and thumb) and only reveals a thin, pastel-colored thumb on hover. Avoid `scrollbar-gutter: stable` — it reserves space based on the browser's default scrollbar width, which conflicts with custom thin scrollbar overrides (`::-webkit-scrollbar { width: 6px }`) and causes a width mismatch.

### Cursor Affordance

All interactive elements (`button`, `a`, `[role="button"]`, `select`, `summary`) must show `cursor: pointer` on hover. Set this as a global rule in `globals.css` rather than per-component — one declaration covers the entire app. Never leave a clickable element with the default arrow cursor.

### Text Truncation in Tables

Table cells ignore `overflow: hidden`. To truncate text with ellipsis inside a `<td>`, wrap cell content in a `<div className="truncate">` inside the `TableCell` component. For cells with flex layouts (e.g. title + badge), add `min-w-0` to the flex container and `truncate` to the text element so the flex child can shrink.

## Anti-Patterns

Never produce:

- Overused font families (Inter, Roboto, Arial, system-ui)
- Purple gradients on white backgrounds
- Cookie-cutter card grids with identical spacing
- Generic hero sections with stock patterns
- Inline `style={{ }}` for things Tailwind can handle
- `'use client'` on an entire page when only a button needs interactivity
- Raw `var()` in inline styles instead of Tailwind utilities wired to CSS variables
