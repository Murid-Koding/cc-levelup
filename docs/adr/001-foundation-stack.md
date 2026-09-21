# ADR-001: MVP Technical Foundation

## Status

Accepted

## Context

CC Level Up! needs a small, SEO-friendly full-stack application with a public archive, an admin CRUD interface, Cloudflare-native hosting, D1 persistence, and lightweight analytics.

The project is developed with coding agents, so conventions must be explicit without creating unnecessary architecture.

## Decision

Use the following baseline:

- Nuxt 4 + TypeScript
- PrimeVue 4
- UnoCSS
- lightweight feature-oriented MVVM
- Nuxt/Nitro as the only app/backend runtime
- Cloudflare Workers
- Cloudflare D1
- Drizzle ORM + Drizzle Kit migrations
- Zod
- PrimeVue Forms + Zod
- pnpm
- Vitest
- Playwright Chromium for critical E2E flows
- ESLint + Prettier
- @nuxtjs/i18n from project start
- GitHub Actions minimal CI
- trunk-based development
- no Pinia until a concrete global-state need exists

Public pages use SSR with route caching/hybrid behavior where appropriate.

## Consequences

### Positive

- one application instead of separate frontend/backend services
- type-safe database access
- Cloudflare-native runtime and persistence
- clear UI separation through lightweight MVVM
- predictable structure for coding agents
- limited dependency and operational surface
- good SEO foundation

### Negative

- team must understand Nuxt/Nitro and Cloudflare runtime constraints
- Drizzle adds an ORM dependency
- MVVM conventions require discipline so ViewModels do not become unnecessary wrappers
- server-only behavior must remain compatible with Workers

## Rejected for MVP

- separate Node backend
- NestJS / Express / Hono as a second app server
- GraphQL
- tRPC
- Prisma
- raw SQL as the primary data access approach
- Pinia by default
- microservices
- repository/interface layers by default
- Kubernetes
- production Docker requirement
