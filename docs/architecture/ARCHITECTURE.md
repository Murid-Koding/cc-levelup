# Architecture — CC Level Up!

## 1. Status

Technical architecture baseline for the MVP.

The PRD v0.2 remains the immutable product source of truth. This document only describes implementation decisions.

## 2. Goals

The architecture should:

- satisfy the PRD without changing product scope
- remain simple enough for a small community product
- keep public pages SEO-friendly and fast
- keep admin writes protected
- support Cloudflare-native deployment
- remain understandable to a solo developer working with coding agents
- avoid infrastructure and abstraction that the MVP does not need

## 3. High-Level Architecture

```text
                           ┌─────────────────────┐
                           │      Visitor        │
                           └─────────┬───────────┘
                                     │
                                     ▼
                           ┌─────────────────────┐
                           │ Cloudflare Edge/CDN │
                           └─────────┬───────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │       Nuxt 4 Worker      │
                        │                          │
                        │ Vue / PrimeVue / UnoCSS  │
                        │ Nuxt SSR + route cache   │
                        │ Nitro server routes      │
                        └──────────┬───────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Drizzle ORM    │
                          └───────┬────────┘
                                  │
                                  ▼
                          ┌────────────────┐
                          │ Cloudflare D1  │
                          └────────────────┘

External browser-loaded services:
- YouTube
- Luma
- Google Drive links

Admin path:
Admin -> Cloudflare Access -> /admin* and /api/admin/*
```

## 4. Runtime and Deployment

### Runtime

Nuxt runs on Cloudflare Workers.

There is no separate backend application for the MVP.

Nuxt/Nitro owns:

- public rendering
- admin rendering
- API endpoints
- server-side database access

### Rendering strategy

Use SSR by default for public indexable pages, with route caching where appropriate.

```text
Public page request
   -> Cloudflare
   -> cached response if valid
   -> otherwise Nuxt SSR
   -> D1 query as needed
```

Admin and write APIs remain dynamic.

This approach avoids a full-site rebuild every time an admin publishes a new session.

## 5. Frontend Stack

- Nuxt 4
- Vue 3
- TypeScript
- PrimeVue 4
- UnoCSS
- @nuxtjs/i18n

### PrimeVue responsibility

PrimeVue provides accessible UI behavior and complex components.

Typical uses:

- forms
- inputs/selects
- dialog
- data table
- pagination
- messages/toasts where appropriate

### UnoCSS responsibility

UnoCSS handles:

- layout
- spacing
- responsive rules
- typography
- page composition
- custom product styling

Avoid wrapping every PrimeVue component.

## 6. Frontend Architecture: Lightweight MVVM

MVVM is applied at feature/page boundaries.

```text
View
  Nuxt page / Vue component
        |
        v
ViewModel
  Vue composable
        |
        v
Model
  types + schemas + API + server data
```

### View

Responsibilities:

- render state
- receive user input
- emit user intent
- compose components

Should avoid:

- large data orchestration
- duplicated fetch/error/loading logic
- direct database knowledge

### ViewModel

Implemented as composables such as:

```text
useSessionArchiveViewModel()
useSessionDetailViewModel()
useAdminSessionFormViewModel()
```

Responsibilities:

- async state
- UI state
- derived/computed state
- feature actions
- orchestration between View and API

Not every component needs a ViewModel.

### Model

Represented by:

- TypeScript types
- Zod schemas
- Drizzle schema
- server API/data behavior

No domain model classes are required for the MVP.

## 7. Suggested Repository Structure

```text
app/
├── pages/
├── layouts/
├── features/
│   ├── home/
│   │   ├── components/
│   │   └── viewmodels/
│   ├── sessions/
│   │   ├── components/
│   │   └── viewmodels/
│   ├── categories/
│   │   ├── components/
│   │   └── viewmodels/
│   └── admin/
│       ├── sessions/
│       │   ├── components/
│       │   └── viewmodels/
│       └── settings/
│           ├── components/
│           └── viewmodels/
└── components/
    └── shared/

shared/
├── schemas/
├── types/
└── utils/

server/
├── api/
│   ├── sessions/
│   ├── categories/
│   ├── events/
│   └── admin/
├── db/
│   ├── schema/
│   └── index.ts
├── services/
└── utils/

drizzle/
└── migrations/

tests/
└── e2e/
```

`server/services/` is optional in practice: create services only when real business logic justifies extraction.

## 8. API Architecture

### Public read API

Examples:

```text
GET /api/sessions
GET /api/sessions/:slug
GET /api/categories
```

### Public analytics ingestion

```text
POST /api/events
```

### Admin API

All administrative mutation routes live under:

```text
/api/admin/*
```

Examples:

```text
GET    /api/admin/sessions
POST   /api/admin/sessions
PUT    /api/admin/sessions/:id
DELETE /api/admin/sessions/:id
PUT    /api/admin/settings/luma
```

No API version prefix is required for the MVP.

## 9. Validation

Zod is the validation layer.

Shared request/form schemas should live in:

```text
shared/schemas/
```

A schema can be reused by:

- PrimeVue Forms
- server API handler

The server always validates independently.

## 10. Database Architecture

Cloudflare D1 is authoritative application storage.

Drizzle ORM provides:

- typed queries
- schema definitions
- migrations through Drizzle Kit

No repository abstraction is required by default.

Default data flow:

```text
Nitro API handler
   -> Zod validation
   -> Drizzle query
   -> D1
```

If a use case accumulates multi-step business rules, extract a service.

## 11. Security Architecture

### Cloudflare Access

Protect both:

```text
/admin*
/api/admin/*
```

Protecting the admin page without the admin API is not sufficient.

### Defense in depth

Administrative server handlers additionally verify the Cloudflare Access assertion before writes.

### Public event ingestion

`POST /api/events` is public by design and protected through:

- strict validation
- supported event whitelist
- edge rate limiting

Do not trust client-supplied analytics payloads beyond what is necessary.

## 12. Cache and Analytics Boundary

Public pages may be cached.

Therefore session analytics must never depend on server render execution.

Browser behavior:

```text
Open detail page
   -> POST page_view beacon

Click YouTube facade
   -> POST video_play beacon
   -> load YouTube iframe
```

This preserves:

- fast cacheable pages
- more meaningful video-play tracking
- reduced crawler inflation

## 13. Search

MVP search remains client-side as defined by the PRD.

Flow:

```text
Archive page
   -> load lightweight search index
   -> filter in browser
```

Do not add a hosted search engine.

Do not add SQLite FTS until data volume actually justifies it.

## 14. SEO

Public session pages must retain:

- SSR/indexable content
- descriptive title and meta description
- Open Graph metadata
- VideoObject structured data
- published-only sitemap
- meaningful text content from descriptions/summaries

Draft content must never enter public SEO surfaces.

## 15. i18n

Install and structure the application with `@nuxtjs/i18n` from the beginning.

MVP language remains Indonesian.

Do not duplicate all content into English unless/when the bilingual roadmap is activated.

## 16. Environment Strategy

Recommended environments:

```text
local
preview
production
```

Avoid a dedicated staging environment until there is a real operational need.

### Local

Use local development bindings and local D1 where practical.

### Preview

Short-lived deployment from a branch/PR where useful.

### Production

Cloudflare Worker + production D1 bindings.

Secrets must be managed through environment/platform secret configuration, not committed files.

## 17. CI/CD

Minimal CI on pull requests and main:

1. install dependencies with pnpm
2. lint
3. typecheck
4. run Vitest
5. production build

Playwright can run:

- on selected PRs
- before release/deploy
- or on main when the environment supports it reliably

Do not block early development on complex multi-browser matrices.

## 18. Git Workflow

Use simple trunk-based development:

```text
main
  \
   feature/short-lived-branch
```

Rules:

- keep branches short-lived
- merge small, coherent changes
- avoid long-running environment branches
- no GitFlow unless the team later has a concrete need

## 19. Architecture Boundaries

Do not add these during MVP without an approved decision:

- second backend application
- microservices
- GraphQL
- tRPC
- Redis
- queues
- event streaming
- production Docker requirement
- Kubernetes
- global state store without a concrete use case
- generic repository/service/interface hierarchies

## 20. Change Policy

If a technical decision changes, record it in an ADR.

If a requested change modifies product behavior or scope, it belongs in product decision-making, not silently in this architecture document.
