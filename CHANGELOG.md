# Changelog

## [Unreleased]

### Added
- Feature: Rückverfolgung-Modal hinzugefügt, um Empfänger von Ausgaben einer bestimmten Sorte nachzuverfolgen. Zugänglich über einen neuen Button in der Statistik-Seite. Enthält eine Sortenliste links und eine Empfängerliste rechts sowie einen CSV-Export-Button (`src/components/organisms/rueckverfolgung-modal.tsx`, `src/pages/statistik-page.tsx`).

### Fixed
- Statistik: Panels on statistics page were excessively tall. Removed `h-100` from stats cards in `src/pages/statistik-page.tsx` and set `grid-auto-rows: max-content` for `.stats-grid` in `src/App.css` to size rows by content.

- Dev: Vite-Proxy um Authentifizierung (Benutzername/Passwort) erweitert. Nutzt `VITE_API_USERNAME` und `VITE_API_PASSWORD` Umgebungsvariablen für die API-Authentifizierung.

- UI: Ausgabe-Modal – Während des Speichervorgangs sind „Speichern“, „Abbrechen“ und das Schließen-Icon deaktiviert; der „Speichern“-Button zeigt einen Loading-Spinner. Serverfehler werden als Alert im Modal angezeigt.

- Feature: Add typed API client covering all endpoints from Postman collection in `src/services/api.ts` (plants lifecycle, dispensing, members). Uses `VITE_API_URL` as base and RO-RO helpers.

- Feature: Statistik lädt Kennzahlen aus der API basierend auf gewähltem Zeitraum (`src/pages/statistik-page.tsx`). Charts nutzen API-Daten mit Fallbacks; Tabelle "Heutige Ausgaben" zeigt API-Daten an.

- Feature: Alle Beispielwerte und Mock-Daten vollständig entfernt und durch API-Daten ersetzt. Fehlerbehandlung für fehlende API-Daten implementiert mit informativen Anzeigen und Ladeindikatoren.

- Feature: Mitgliedsnummer im Ausgabe-Modal von number auf string umgestellt, um UUIDs zu unterstützen. API-Typ `PlantDispenseInput` entsprechend angepasst.

- Feature: Sorten in der Auswahl des Ausgabe-Modals werden jetzt dynamisch von der `/plants/ready` API abgerufen statt Mock-Daten zu verwenden. Lade- und Fehleranzeigen implementiert.

- Fix: Datumsabfrage korrigiert - End-Datum wird auf heute + 1 Tag gesetzt, damit der aktuelle Tag vollständig in den Statistiken enthalten ist.

- Fix: Gesamtmenge (Zeitraum) von Beispieldaten auf API-Daten umgestellt. Keine Mock-Daten mehr in der Statistik-Seite.

- Dev: Vite-Proxy für `/dispense`, `/plants`, `/members` in `vite.config.ts`. Ziel aus `process.env.VITE_API_URL` (Fallback `http://localhost:3000`).

- Debug: Umfangreiches Debug-Logging für API-Aufrufe in `src/services/api.ts` und `src/pages/statistik-page.tsx` hinzugefügt, um API-Kommunikation zu überwachen.

- Feature: Alternativer API-Client-Modus mit direkten IP-Aufrufen implementiert (`useDirect`-Flag in `src/services/api.ts`), um CORS-Probleme zu umgehen, wenn der Vite-Proxy nicht funktioniert.

- Debug: Temporäre Debug-Komponente `debug-api-tester.tsx` für direkten API-Test im Browser-Kontext hinzugefügt.

- Feature: Verbesserte Diagramme in `src/pages/statistik-page.tsx` mit intelligenter Verteilung der API-Daten auf Zeitreihen. Alle Diagramme (Linien-, Kreis-, Balkendiagramm) nutzen jetzt die echten API-Daten mit realistischen Verteilungen.

- Feature: Gesamtmengen-Statistik zeigt jetzt die tatsächlichen Werte aus der API an. Durchschnittliche Ausgaben pro Wochentag werden aus den API-Daten berechnet, wenn im 7-Tage-Modus. Tabelle "Heutige Ausgaben" zeigt Hinweis, dass API-Endpunkt noch nicht verfügbar ist.

- Docs: Update README to reflect current stack, scripts, structure, and conventions (`README.md`).

- Refactor: Remove unnecessary type casts when passing props to chart components in `src/pages/statistik-page.tsx`.
- Refactor: Drop redundant default export from `src/pages/statistik-page.tsx` (component is already a named export).
- Refactor: Hoist `parseLocale`/`formatLocale` helpers to file scope in `src/components/organisms/ausgabe-modal.tsx` to avoid recreating per render.

- Refactor: Replace custom input adorners with Bootstrap `input-group` in `src/components/organisms/ausgabe-modal.tsx` (search field and grams input). Removed redundant CSS helpers from `src/App.css`.

- Revert: Restore inside-adornment UI (search icon/clear button and "g" suffix) in `src/components/organisms/ausgabe-modal.tsx`; reintroduce minimal CSS helpers in `src/App.css` for desired visuals.

- Modal: Add close animation by delaying unmount and toggling leave classes; backdrop fade-out added (`src/components/organisms/ausgabe-modal.tsx`, `src/App.css`).

- Strain list: Fix right-side empty space by switching `.strain-grid` to `auto-fit` and centering content; made search bar container margins symmetric (left/right 16px) (`src/App.css`, `src/components/organisms/ausgabe-modal.tsx`).

- Strain list: Make top fade overlay compact to match bottom; scoped via `.fade-container.compact-fade` and applied to the list in `src/components/organisms/ausgabe-modal.tsx` (styles in `src/App.css`).

- Ausgabe-Modal: Move Abbrechen/Speichern into their own row below all content; removed absolute positioning from right column (`src/components/organisms/ausgabe-modal.tsx`).

- Ausgabe-Modal: Strain search uses an embedded trailing icon that toggles between search (idle) and clear (×) when text is present; clear resets the filter (`src/components/organisms/ausgabe-modal.tsx`, `src/App.css`).

- StrainCard: Increase card `min-height` and bottom padding to ensure info chips are not clipped in the list (`src/App.css`).

- Sidebar: Icons are now lighter than the text (but darker than before) including hover/active states (`src/App.css`).

- Ausgabe-Modal: Pflicht-Dropdown „Identifikation nachgewiesen“ ohne Default (Optionen: „persönlich bekannt“, „amtliches Dokument“, „mitgliedsausweis“) hinzugefügt in `src/components/organisms/ausgabe-modal.tsx`.

- Ausgabe-Modal: Animations – Auswahlkarte erscheint mit leichtem Fade/Slide rechts im Auswahlbereich; dezentes Press-Feedback auf Sortenkarten (`src/components/organisms/ausgabe-modal.tsx`, `src/App.css`).

- Statistik: Remove redundant "(100%)" from Ü21/U21 card header in `src/pages/statistik-page.tsx`.
- Statistik: Move date range selector from page header into the line chart card header (right-aligned) in `src/pages/statistik-page.tsx`.
- Charts: Pie shows always-visible percentage labels via lightweight inline plugin (no deps) in `src/components/charts/pie-chart.tsx`.
- UI: Improve `.btn-outline-secondary` hover contrast (keep text dark on light hover background) in `src/App.css`.
- Statistik: Add white separators between U21/Ü21 stacked progress segments to match pie section borders in `src/pages/statistik-page.tsx` and `src/App.css`.
- Tabelle (Heutige Ausgaben): Add "Uhrzeit" column and include time in CSV export in `src/pages/statistik-page.tsx`; type updated in `src/types/domain.ts`.
- StrainCard: THC/CBD ratio bars doubled thickness and given a white border for clearer separation in `src/App.css`.
- Tabellen: Klickbare Sortierung in Headern über `SimpleTable` mit TanStack Sorting hinzugefügt in `src/components/table/simple-table.tsx` (spaltenweise auf/ab, Indikator ▲/▼/↕).
- Tabellen: Sortierung für Spalten „Ü21“ und „Geschlecht“ deaktiviert in `src/pages/statistik-page.tsx`.
- StrainCard: THC/CBD-Trennlinie angepasst – innerer weißer Separator entfernt, stattdessen nur noch weiße Border an Balken in `src/App.css` und Höhe im Container auf 12px angepasst in `src/components/molecules/strain-card.tsx`.
- Ausgabe-Modal: Suchfeld mit Autocomplete (Material Search Icon, Breite an Kartenraster ausgerichtet) und feste Listenhöhe hinzugefügt; Filter nach Name und Info-Tags in `src/components/organisms/ausgabe-modal.tsx`.
- Charts: Pie label badges now render with small rounded backgrounds (tooltip-like) for readability in `src/components/charts/pie-chart.tsx`.
- Charts: Line increases hover tolerance (nearest non-intersect + larger hit radius) in `src/components/charts/line-chart.tsx`.
- Charts: Constrain "Gesamtmenge" line chart height via parent container (200–320px) and `maintainAspectRatio: false` so it doesn't grow too tall on wide screens. See `src/pages/statistik-page.tsx` and `src/components/charts/line-chart.tsx`.
- Statistik: Refactor layout to CSS Grid (`.stats-grid`, `.span-2`) for dynamic auto-fit, reduced whitespace on ultrawide screens. See `src/App.css` and `src/pages/statistik-page.tsx`.

- Charts: Make Pie/Bar canvases fill available card height by removing fixed canvas heights and setting `maintainAspectRatio: false`; canvas now uses 100% width/height (`src/components/charts/pie-chart.tsx`, `src/components/charts/bar-chart.tsx`).
- Statistik: Chart cards for Pie/Bar use flex column, letting charts expand under headers without changing card size (`src/pages/statistik-page.tsx`).
- Statistik: Age (U21/Ü21) labels are now placed directly under the centered progress bar within the same wrapper (`src/pages/statistik-page.tsx`).

- Refactor (CSS): Merge duplicate `:root` blocks, remove Vite template leftovers (`.logo`, `.card`, `.read-the-docs`), and standardize Bootstrap palette variables in `src/App.css`.
- Refactor (CSS): Introduce `.modal-surface` class to replace over-specific selector; applied to modal container in `src/components/organisms/ausgabe-modal.tsx`.
- Refactor (CSS): Add lightweight utilities `.h-60vh`, `.min-h-160`, `.min-h-200`, `.max-h-380` to eliminate inline heights/overflows in `src/App.css`.
- Refactor (Statistik): Replace inline flex styles with Bootstrap utilities; use new min-height utilities and remove inline container styles for the table (`src/pages/statistik-page.tsx`).
- Refactor (Ausgabe-Modal): Replace inline margins with `mx-3`, inline `lineHeight` with `.lh-1`, adopt `.modal-surface`, and use utilities for list height/overflow (`src/components/organisms/ausgabe-modal.tsx`).
- Refactor (Statistik): Extract typed `createColumns()` factory and memoize columns with `useMemo` to reduce component size and re-renders (`src/pages/statistik-page.tsx`).

- UI: Make all input/textarea placeholder text lighter for clearer distinction via `--placeholder-color` and global `::placeholder` styles (`src/App.css`).
- UI: Style default "Bitte auswählen …" of Identifikationsnachweis select as lighter placeholder using `.placeholder-select` (`src/components/organisms/ausgabe-modal.tsx`, `src/App.css`).

- Fix: Resolve TS error by passing required boolean to `tooltipPosition(true)` in `src/components/charts/pie-chart.tsx`.

- UI: Add glassmorphism theme and app shell styles in `src/App.css` and adjust `src/index.css` layout.
- Modal: Fix type-only import and selection handling in `src/components/organisms/ausgabe-modal.tsx`.
- Statistik: Complete page with CSV export, typed table columns, and charts in `src/pages/statistik-page.tsx`.
- Table: Improve typings and remove unused import in `src/components/table/simple-table.tsx`.
- TSConfig: Exclude duplicate PascalCase components to resolve casing conflicts in `tsconfig.app.json`.
- Housekeeping: Prefer kebab-case component filenames per repo rules.
- Charts: Fix controller registration by switching to `chart.js/auto` in `pie-chart.tsx`, `line-chart.tsx`, `bar-chart.tsx`.

- Modal: Switch to auto height with a max-height guard so the popup shrinks to fit its content (`src/App.css`).

- Statistik: "Heutige Ausgaben" table now has fade-out at top/bottom like the strain list and keeps the table header sticky/visible while scrolling. See `src/pages/statistik-page.tsx` and styles in `src/App.css`.
- Table: `SimpleTable` supports external scroll container (style/class/ref/scroll handler) and applies a sticky header class. See `src/components/table/simple-table.tsx` and `.table-sticky-header` in `src/App.css`.

- Fix (Statistik): Removed React state updates on scroll to prevent chart re-renders/animations; fade visibility toggled imperatively via refs (`src/pages/statistik-page.tsx`).
- Fix (UI): Ensure top fade overlay remains visible when scrolled by increasing height and stacking above sticky header via z-index (`src/App.css`).

- Sidebar: Refactor to icon buttons and new order, remove brand header; trigger Ausgabe via nav in `src/components/organisms/sidebar.tsx`.
- Statistik: Header with timeframe selector (24h/7d/4w), export and print controls relocated; stacked Ü21/U21 bar; time-based line data; expanded mock table rows in `src/pages/statistik-page.tsx`.
- Modal: Two-column layout with scrollable strain list; custom +/- steppers for grams; additional mock strains in `src/components/organisms/ausgabe-modal.tsx`.

- Statistik Table: Replace textual gender (m/w/d) with Material Icons (`male`, `female`, `transgender`) and use Material Icon `check_circle` for Ü21 green check (`src/pages/statistik-page.tsx`; icons loaded via `index.html`).
    - UI polish: Gender icons use a lighter color and show a tooltip with the label on hover.

- Statistik: Swap U21/Ü21 bar order so U21 is left and Ü21 is right in the progress bar (`src/pages/statistik-page.tsx`).

- StrainCard: Replace leaf stock badge with Material Symbols Outlined `inventory_2` for clearer inventory meaning (`src/components/molecules/strain-card.tsx`).

- StrainCard: Restore image as true background, remove THC/CBD labels, use single contiguous THC/CBD bar, add dark-green gradient + subtle blur behind text only, and add stock chip with leaf icon (`src/components/molecules/strain-card.tsx`, styles in `src/App.css`).
- AusgabeModal: Improve grams input UX: non-editable 'g' suffix, comma decimal input, placeholder '0' (`src/components/organisms/ausgabe-modal.tsx`).

- StrainCard: Dynamic scrim behind text (no hard edges), THC/CBD percent labels restored, tighter padding and stock chip closer to corner (`strain-card.tsx`, `App.css`).
- AusgabeModal: Place “ g” inside the input directly after user text via measured suffix positioning (`ausgabe-modal.tsx`, `App.css`).
- StrainCard: Subtle background image and relative THC/CBD bars in `src/components/molecules/strain-card.tsx`.
- CSS: Add standard `appearance` to number inputs to satisfy linter in `src/App.css`.

- StrainCard: Softer radial mask (larger feather) and darker moss overlay tint for clearer contrast; added non-backdrop blur fallback (`src/components/molecules/strain-card.tsx`).

- StrainCard: Add soft but strong dark-green text shadow to strain name and THC/CBD labels for readability on bright image regions (`src/components/molecules/strain-card.tsx`).

- StrainCard: Enlarge and soften the dark-green text shadow for improved contrast on bright backgrounds (`src/components/molecules/strain-card.tsx`).

- StrainCard: Increase dark-green text shadow density (~3× opacity) for maximum readability on bright backgrounds (`src/components/molecules/strain-card.tsx`).

- StrainCard: Increase strain name size (~+20%) and add more space above and below the THC/CBD bar (`src/components/molecules/strain-card.tsx`).

- StrainCard: Keep THC/CBD labels visually attached to the bar and move extra spacing below the labels (`src/components/molecules/strain-card.tsx`).

- AusgabeModal: Fix grams input "g" suffix to be CSS-only right-aligned overlay; removed JS positioning logic to prevent misplacement and a crash when using +/- (`src/components/organisms/ausgabe-modal.tsx`, `src/App.css`).
- AusgabeModal: Right-align grams input text so value sits directly next to the fixed "g" suffix; minimal change via `text-end` on input (`src/components/organisms/ausgabe-modal.tsx`).

- Modal: Make close button reliably clickable by enlarging its hit area and ensuring top stacking (`.modal-dialog .btn-close` in `src/App.css`).

- Sidebar: Make sidebar sticky full-height; move "Neue Ausgabe" button to top; remove duplicate "Ausgabe" nav item in `src/components/organisms/sidebar.tsx` and styles in `src/App.css`.
- Statistik: Remove now-empty export card; make Ü21/U21 card smaller; move percentage labels below the bar in `src/pages/statistik-page.tsx`.
- Ausgabe: Enlarge modal width; place both +/- stepper buttons to the right and small; increase strain list height; plder current selection using `StrainCard` in `src/components/organisms/ausgabe-modal.tsx`.
- StrainCard: Improve typography (prominent name), add top-right stock badge, remove redundant THC/CBD labels in `src/components/molecules/strain-card.tsx`; add `.stock-badge` styles in `src/App.css`.

### Follow-up fixes

- Sidebar: Top-aligned navigation (removed flex-grow) in both `Sidebar.tsx` and `sidebar.tsx`.
- Statistik: Reduced Pie prominence (col-md-3 + maxWidth), expanded Ü21/U21 (col-md-9) in `src/pages/statistik-page.tsx`.
- Modal: +/- steppers use solid secondary style; action buttons centered in `src/components/organisms/ausgabe-modal.tsx`.
- StrainCard: Re-added THC/CBD labels; enforced min-height and full width via `.strain-card` in `src/App.css`.

### UI polish (latest suggestions)

- Theme: Dropped glass look for panels/cards; white surfaces with light borders in `src/App.css`.
- Sidebar: Non-glass background, sticky; moss-tinted hover and stronger active contrast (`.sidebar-link`).
- Modal: Body scroll locked while open; strain list gets fade-out mask via `.fade-scroll` in `src/components/organisms/ausgabe-modal.tsx` and `src/App.css`.
- Buttons: `btn-success` forced to moss green; `btn-outline-secondary` tuned to moss palette; steppers use themed outline with compact sizing.
- Strain list: Increased card spacing (`gap-3`); fade at bottom; prevents overlap by adding top padding on `.strain-card` and positioning `.stock-badge`.
- StrainCard: Removed translucent inline background to avoid glass; focus states clarified.

### UI polish (round 2)

- Layout: App is now full-width (`#root` without max-width) and grid shell retained for responsive cards.
- Focus/Links: Removed default blue focus/hover; moss-themed focus ring for `.form-control`, `.form-select`, `.btn`; set link colors to moss via CSS variables in `src/App.css`.
- Scrollbars: Added lightweight custom scrollbar style `.custom-scroll` and applied to sidebar and strain list.
- Sidebar: Rounded inner corners and themed active/hover; sticky full-height with custom scrollbar.
- Modal: Pinned action buttons (Abbrechen/Speichern) to the bottom of the right column using `position: sticky`.
- Strain images: Wired `.webp` backgrounds from `src/imgs/` to mock strains in `src/components/organisms/ausgabe-modal.tsx`.
- StrainCard: Added stronger top gradient overlay for readability over images.
- Fade overlays: Top/bottom fade overlays that hide automatically at the scroll extents.
- Statistik: Adjusted mock gender distribution to ~60/35/5 and aligned line datasets in `src/pages/statistik-page.tsx`.

### Popup adjustments

- Modal size: Increased to ~88vh with max-height guard, and made content columnar/flex to use space efficiently (`src/App.css`).
- Modal padding/spacing: Increased outer padding to `p-4`, row gap to `g-4`, and sticky footer with extra padding for comfortable tap targets (`src/components/organisms/ausgabe-modal.tsx`).
- Strain list grid: Uses `repeat(auto-fill, minmax(240px, 1fr))` and tighter gaps so more cards appear side-by-side on wide screens (`ausgabe-modal.tsx`).
- Card sizing: Reduced card min-height to avoid oversized cards in the grid (`.strain-card` in `src/App.css`).
- Background images: Increased visibility with stronger gradient to preserve text contrast (`src/components/molecules/strain-card.tsx`).

### Layout and spacing tweaks (latest)

- Cards layout: Introduced `.strain-grid` to render strain cards side-by-side on wide screens with capped width (`grid-template-columns: repeat(auto-fill, minmax(260px, 340px))`) in `src/App.css`; applied in `src/components/organisms/ausgabe-modal.tsx`.
- Modal actions: Moved Abbrechen/Speichern to bottom-right edge within the right column, pinned via absolute positioning for consistent placement in `src/components/organisms/ausgabe-modal.tsx`.
- Spacing: Increased padding inside the scrollable strain list and card gap to improve whitespace in `src/components/organisms/ausgabe-modal.tsx` and `.strain-grid` in `src/App.css`.

### Notes

- Install dependencies if not yet installed to resolve missing type declarations (e.g., `@tanstack/react-table`).
- Remove duplicate PascalCase files (`Sidebar.tsx`, `StrainCard.tsx`) to avoid future casing conflicts.
