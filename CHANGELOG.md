# Changelog

## [Unreleased]

- UI: Add glassmorphism theme and app shell styles in `src/App.css` and adjust `src/index.css` layout.
- Modal: Fix type-only import and selection handling in `src/components/organisms/ausgabe-modal.tsx`.
- Statistik: Complete page with CSV export, typed table columns, and charts in `src/pages/statistik-page.tsx`.
- Table: Improve typings and remove unused import in `src/components/table/simple-table.tsx`.
- TSConfig: Exclude duplicate PascalCase components to resolve casing conflicts in `tsconfig.app.json`.
- Housekeeping: Prefer kebab-case component filenames per repo rules.
- Charts: Fix controller registration by switching to `chart.js/auto` in `pie-chart.tsx`, `line-chart.tsx`, `bar-chart.tsx`.

- Sidebar: Refactor to icon buttons and new order, remove brand header; trigger Ausgabe via nav in `src/components/organisms/sidebar.tsx`.
- Statistik: Header with timeframe selector (24h/7d/4w), export and print controls relocated; stacked Ü21/U21 bar; time-based line data; expanded mock table rows in `src/pages/statistik-page.tsx`.
- Modal: Two-column layout with scrollable strain list; custom +/- steppers for grams; additional mock strains in `src/components/organisms/ausgabe-modal.tsx`.
- StrainCard: Subtle background image and relative THC/CBD bars in `src/components/molecules/strain-card.tsx`.
- CSS: Add standard `appearance` to number inputs to satisfy linter in `src/App.css`.

### Notes
- Install dependencies if not yet installed to resolve missing type declarations (e.g., `@tanstack/react-table`).
- Remove duplicate PascalCase files (`Sidebar.tsx`, `StrainCard.tsx`) to avoid future casing conflicts.
