# Changelog

## [Unreleased]

- UI: Add glassmorphism theme and app shell styles in `src/App.css` and adjust `src/index.css` layout.
- Modal: Fix type-only import and selection handling in `src/components/organisms/ausgabe-modal.tsx`.
- Statistik: Complete page with CSV export, typed table columns, and charts in `src/pages/statistik-page.tsx`.
- Table: Improve typings and remove unused import in `src/components/table/simple-table.tsx`.
- TSConfig: Exclude duplicate PascalCase components to resolve casing conflicts in `tsconfig.app.json`.
- Housekeeping: Prefer kebab-case component filenames per repo rules.
- Charts: Fix controller registration by switching to `chart.js/auto` in `pie-chart.tsx`, `line-chart.tsx`, `bar-chart.tsx`.

### Notes
- Install dependencies if not yet installed to resolve missing type declarations (e.g., `@tanstack/react-table`).
- Remove duplicate PascalCase files (`Sidebar.tsx`, `StrainCard.tsx`) to avoid future casing conflicts.
