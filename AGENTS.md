# AGENTS.md — CC Level Up!

## 1. Purpose

This file defines how coding agents must work in this repository.

The product requirements are defined by the approved PRD v0.2. The PRD is the product source of truth and MUST NOT be edited, rewritten, "corrected", or silently reinterpreted by coding agents.

Technical documents may explain HOW the PRD is implemented, but they must not change WHAT the product requires.

## 2. Core Working Principles

1. Prefer the simplest implementation that satisfies the PRD and acceptance criteria.
2. Do not introduce architecture, dependencies, patterns, or infrastructure without a concrete need.
3. Do not implement features outside the PRD or the current task.
4. Do not silently resolve open product questions from the PRD.
5. Keep changes small, reviewable, and scoped to one task or vertical slice.
6. Read existing code and nearby tests before modifying a feature.
7. Preserve existing conventions unless a task explicitly changes them.
8. Never weaken security, validation, accessibility, SEO, or data integrity for convenience.
9. A task is not done until the relevant quality checks pass.
10. If implementation requires a product decision not yet made, stop at the technical boundary and clearly state the decision needed.

## 3. Locked Technical Baseline

- Framework: Nuxt 4.x
- Language: TypeScript
- UI component library: PrimeVue 4.x
- CSS engine: UnoCSS
- Frontend architecture: lightweight feature-oriented MVVM
- Runtime: Cloudflare Workers
- Database: Cloudflare D1
- Database access: Drizzle ORM
- Migrations: Drizzle Kit migration files committed to Git
- Package manager: pnpm
- Validation: Zod
- Forms: PrimeVue Forms + Zod
- Unit/integration testing: Vitest
- E2E testing: Playwright, Chromium only for MVP
- Linting: ESLint
- Formatting: Prettier
- i18n: @nuxtjs/i18n installed from the beginning; MVP UI/content remains Indonesian
- CI: GitHub Actions
- Git workflow: trunk-based development with short-lived feature branches
- Global state: no Pinia unless a real cross-page state need appears

Do not replace any locked choice without an explicit architecture decision approved by the project owner.

## 4. Architecture Rules

### 4.1 Frontend MVVM

Use MVVM as a lightweight organizational pattern, not as class-heavy enterprise architecture.

**View**

- Nuxt pages
- Vue SFCs
- PrimeVue components
- feature components

**ViewModel**

- Vue composables named `use*ViewModel`
- owns page/feature UI state, async state, derived state, and UI actions
- created only when useful

**Model**

- shared TypeScript types
- shared Zod schemas
- server APIs
- Drizzle schema and D1 data

Rules:

- Pages should remain thin.
- Presentational components should prefer props/emits and should not receive a ViewModel unless they actually need orchestration/state.
- Do not create model classes just to satisfy the MVVM label.
- Do not create `server/viewmodels`.
- Do not add Pinia until cross-page global client state is clearly needed.

### 4.2 Feature-oriented Organization

Prefer:

```text
app/features/<feature>/
  components/
  viewmodels/
```

Do not organize the whole app into global `models/`, `views/`, and `viewmodels/` folders.

Shared code belongs in `shared/` only when it is genuinely shared by multiple features/layers.

### 4.3 PrimeVue + UnoCSS

- Use PrimeVue directly for standard UI behavior and accessible complex widgets.
- Use UnoCSS for layout, spacing, typography, responsive rules, and custom application styling.
- Do not wrap every PrimeVue component in `AppButton`, `AppInput`, etc.
- Create wrappers only when the application has recurring behavior or design that justifies one.
- Prefer PrimeVue styled mode as baseline.
- Use Pass Through / localized unstyled customization only where needed.

### 4.4 Server Architecture

Use Nuxt/Nitro server routes. Do not add a separate backend framework unless requirements materially change.

Default flow:

```text
API handler
  -> validate input
  -> execute simple query/business logic
  -> Drizzle
  -> D1
```

Do not introduce repository interfaces, repository implementations, service interfaces, DTO mappers, or dependency-injection containers by default.

Extract `server/services/*` only when business logic is substantial enough that keeping it in a handler would reduce clarity or reuse.

## 5. API Conventions

Use simple REST-style resource routes.

Public read routes may live under:

```text
/api/sessions
/api/categories
```

All admin mutations MUST live under:

```text
/api/admin/*
```

Analytics ingestion remains public:

```text
POST /api/events
```

Do not add `/v1` versioning for the MVP.

### Success responses

Return the resource or a naturally structured object.

Examples:

```ts
return session
```

```ts
return {
  sessions,
  pagination
}
```

Do not force a generic `{ success, data, meta, timestamp }` envelope around every response.

### Error responses

Use a consistent HTTP error shape. Validation errors should expose field-level errors when useful.

Server-side validation is mandatory even when the client has already validated the same data.

## 6. Shared Validation

Put schemas shared by forms and APIs under:

```text
shared/schemas/
```

A shared schema may be reused by:

- PrimeVue form validation
- server API validation

Client validation is UX only. The server is authoritative.

## 7. Database Rules

- Cloudflare D1 is the database.
- Use Drizzle ORM for queries.
- Use Drizzle Kit for migrations.
- Schema changes must produce migration files.
- Migration files must be reviewed and committed.
- Do not rely on schema push as the production migration strategy.
- Preserve indexes required by the PRD.
- Keep relations explicit and aligned with the PRD data model.
- Do not denormalize or change cardinality unless approved by an ADR.

Initial domain entities from the PRD:

- SharingSession
- Pembicara
- Kategori
- SessionKategori
- SessionEvent
- Setting

## 8. Security Invariants

These rules are non-negotiable.

### Admin

Cloudflare Access protects:

- `/admin*`
- `/api/admin/*`

Server-side admin mutation handlers must also verify the Cloudflare Access assertion before processing writes.

Never implement a second custom username/password authentication system for the MVP.

### Public event endpoint

`POST /api/events` is intentionally public.

It must:

- validate payloads
- accept only supported event types
- avoid trusting arbitrary client data
- be protected by Cloudflare rate limiting at the edge

### Data exposure

- Draft sessions must never appear in public lists, search indexes, sitemap, related-session queries, or public detail responses.
- Do not expose secrets or Cloudflare credentials to client bundles.
- Do not commit secrets.

## 9. Rendering, Caching, and Analytics

The application uses Nuxt SSR with route caching/hybrid behavior where appropriate.

Public pages:

- server-rendered for SEO
- cacheable where appropriate

Admin:

- dynamic

APIs:

- dynamic unless explicitly designed otherwise

Analytics:

- never increment page views inside cached page-render logic
- `page_view` and `video_play` must be sent client-side to `/api/events`
- preserve the YouTube facade behavior so a `video_play` represents user intent

Do not disable caching merely to make counters work.

## 10. SEO Rules

For public session pages preserve:

- indexable server-rendered text
- title and meta description
- Open Graph metadata
- YouTube thumbnail usage where appropriate
- schema.org `VideoObject`
- canonical behavior where applicable
- sitemap containing only published content

Do not make session detail content client-only if doing so harms indexability.

## 11. Search Rules

For the MVP, follow the PRD:

- search is client-side
- use a lightweight index payload
- searchable data includes the PRD-defined fields
- do not introduce a search service or SQLite FTS unless scale genuinely requires it later

## 12. Testing Rules

### Vitest

Test logic with meaningful failure risk:

- ViewModel state/derived logic
- utilities
- validation behavior where non-trivial
- server/business logic when extracted

Do not chase 100% code coverage.

Prefer colocated tests for feature logic.

### Playwright

Use Chromium only for MVP.

Protect critical flows:

- visitor can browse published archive
- visitor can open published session detail
- draft sessions are not publicly accessible
- admin session CRUD works in the test environment
- important publication-state behavior works

## 13. Definition of Done

A task is DONE only when all relevant items are true:

- acceptance criteria are satisfied
- TypeScript/typecheck passes
- lint passes
- relevant tests pass
- production build passes
- migration is included if schema changed
- server input is validated
- loading/error/empty states are handled where relevant
- responsive behavior is considered
- accessibility is considered
- no secrets are committed
- no unrelated refactor is mixed into the task
- architecture docs/ADR are updated only if an architecture decision actually changed

## 14. Agent Workflow

For each task:

1. Read the task and its acceptance criteria.
2. Inspect relevant existing code, schemas, and tests.
3. Identify the smallest implementation that satisfies the task.
4. Make focused changes.
5. Add/update tests proportionate to risk.
6. Run the relevant checks.
7. Report:
   - what changed
   - tests/checks run
   - any limitation or unresolved product decision

Do not perform large speculative refactors.

## 15. Product Open Questions

The PRD currently contains unresolved product questions.

Coding agents MUST NOT silently decide them.

If a task depends on one of them:

- use an explicit acceptance criterion supplied for that task, or
- surface the decision needed

Do not alter the PRD to record technical assumptions.

## 16. Prohibited by Default

Do not add these without a demonstrated need and explicit approval:

- separate backend service
- NestJS / Express / Hono as an additional app server
- GraphQL
- tRPC
- Pinia
- Redis
- queues
- microservices
- Docker as a production requirement
- Kubernetes
- generic CRUD framework
- repository/service/interface layers with no concrete need
- Storybook
- monorepo
- event bus
- custom authentication system
- abstraction wrappers for every PrimeVue component

Keep the application boring, explicit, and easy to maintain.
