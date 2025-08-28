# CSC Verwaltung

A lightweight, opinionated React + TypeScript app for cannabis social club administration with a statistics dashboard and a disbursement workflow.

## Tech stack

- React 19 + TypeScript
- Vite 7
- Bootstrap 5 (utility classes only, no JS)
- Chart.js 4 (Pie, Line, Bar)
- TanStack Table v8
- Google Material Symbols (icons)

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – type-check and build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

## Structure

- `src/pages/statistik-page.tsx` – dashboard: pie (gender), stacked progress (U21/Ü21), line (time range), bar (weekday averages), table (heutige Ausgaben) with CSV export and print
- `src/components/organisms/ausgabe-modal.tsx` – Ausgabe modal: strain search with embedded trailing icon (search/clear), scrollable strain grid with fade overlays, grams stepper, member number, identification select, current selection, and bottom-row actions
- `src/components/charts/*` – thin wrappers around Chart.js (pie/line/bar)
- `src/components/molecules/strain-card.tsx` – image card with THC/CBD bars, stock badge, selection state
- `src/components/table/simple-table.tsx` – typed table (TanStack) with external scroll container and sticky header
- `src/App.css` – theme, layout, fades, custom scrollbars, card styles, input affordances

## Conventions

- TypeScript strictly typed; avoid `any`
- File naming: kebab-case for files/dirs; PascalCase for classes; camelCase for functions/vars
- Keep functions short and single-purpose; favor early returns and map/filter/reduce
- Prefer immutability; use `readonly` and literal `as const` where applicable

## Icons

Material Symbols are loaded in `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
```

---
