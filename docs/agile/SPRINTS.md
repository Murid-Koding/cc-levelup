# Agile Delivery Plan — CC Level Up!

## Working Model

Use lightweight agile delivery.

A sprint is a small vertical slice with a demonstrable outcome, not necessarily a fixed two-week period.

Prefer:

- small stories
- explicit acceptance criteria
- short feedback loops
- working software over large speculative batches

Do not ask a coding agent to "implement the entire PRD".

## Sprint 0 — Foundation

Goal: make the repository safe and predictable to develop.

Scope:

- bootstrap Nuxt 4 project
- pnpm setup
- TypeScript configuration
- PrimeVue setup
- UnoCSS setup
- @nuxtjs/i18n setup
- ESLint + Prettier
- Vitest
- Playwright Chromium
- Cloudflare Workers configuration
- D1 binding configuration
- Drizzle + Drizzle Kit setup
- initial folder structure
- GitHub Actions minimal CI
- environment documentation
- initial database migration skeleton
- smoke build

Exit criteria:

- app runs locally
- production build succeeds
- D1 local/dev access works
- CI quality checks run
- empty architecture skeleton matches AGENTS.md

## Sprint 1 — Core Data Model

Goal: implement the PRD data model and seed enough development data to build public UI.

Scope:

- SharingSession
- Pembicara
- Kategori
- SessionKategori
- SessionEvent
- Setting
- indexes and constraints
- seed/dev data strategy
- server database utility

Exit criteria:

- migrations reproducible
- basic read/write test passes
- relations behave as expected

## Sprint 2 — Public Archive Slice

Goal: visitor can browse published sessions.

Scope:

- public session listing
- newest-first ordering
- session card
- pagination
- responsive grid
- published-only data
- loading/error/empty states

Exit criteria:

- archive slice is demonstrable
- draft session is absent from public results

## Sprint 3 — Session Detail Slice

Goal: visitor can open and consume one published session.

Scope:

- `/sesi/{slug}`
- metadata
- speaker/date/categories
- description
- summary/transcript content
- material link
- YouTube facade
- related sessions
- 404/unpublished behavior
- SEO metadata foundation

Exit criteria:

- direct URL works
- draft/unpublished session is not public
- YouTube iframe loads only after facade interaction

## Sprint 4 — Discovery

Goal: visitor can find sessions by topic/content.

Scope:

- lightweight client-side search index
- search UI
- category filter
- category URL page
- active-filter state
- published-only search data

Exit criteria:

- no API call per keystroke
- search/filter experience is responsive for MVP dataset

## Sprint 5 — Admin CRUD

Goal: admin can manage archive content.

Scope:

- admin session list
- create session
- edit session
- delete session
- draft/published state
- speaker/category assignment
- setting for Luma embed URL
- Cloudflare Access boundary
- server validation

Exit criteria:

- admin write APIs live under `/api/admin/*`
- public content reflects publication state correctly

## Sprint 6 — Analytics

Goal: community-owned engagement events are recorded correctly.

Scope:

- `page_view`
- `video_play`
- `/api/events`
- sendBeacon/fetch client integration
- referrer capture as defined
- edge rate limiting configuration
- initial aggregate/admin insight query as needed by MVP

Exit criteria:

- cached public rendering does not break counters
- video play is recorded on facade interaction

## Sprint 7 — SEO, Performance, Accessibility

Goal: harden public experience for launch.

Scope:

- sitemap
- VideoObject
- OG metadata
- image/lazy loading behavior
- public cache rules
- accessibility pass
- keyboard behavior
- relevant Lighthouse-style review
- 404 page

Exit criteria:

- published pages are indexable
- no draft content appears in sitemap/public metadata
- major accessibility regressions resolved

## Sprint 8 — Operations and Launch Hardening

Goal: make the MVP operable after launch.

Scope:

- data export
- backup/export workflow
- production environment review
- Cloudflare Access policy verification
- API protection verification
- analytics verification
- final critical E2E suite
- launch checklist

Exit criteria:

- production deployment is repeatable
- backup/export path is usable
- critical security boundaries are verified
