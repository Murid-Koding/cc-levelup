# Development Environment

## Required local tools

- Node.js version compatible with the selected Nuxt 4 release
- pnpm
- Git
- Cloudflare Wrangler CLI through project dependencies/scripts

Prefer project-local CLI dependencies over requiring many global packages.

## Environments

Use three practical environment modes:

- local
- preview
- production

Do not add a separate permanent staging environment until there is a concrete need.

## Secrets

Rules:

- never commit secrets
- do not put production secrets in `.env.example`
- use Cloudflare secret/environment configuration for deployed environments
- keep public runtime config clearly separated from server-only secrets

## D1

Use separate local/development data from production.

Production migrations must be explicit and versioned.

Do not use direct schema push as the normal production migration flow.

## Cloudflare bindings

The Worker needs the D1 binding required by the application.

Binding names should be stable and documented once the bootstrap task creates the actual `wrangler.jsonc`.

Do not invent production database IDs in committed templates.

## Admin authentication

Authentication is provided by Cloudflare Access.

Expected protected paths:

```text
/admin*
/api/admin/*
```

Server handlers processing admin writes also verify the Access assertion.

Local development may use a clearly isolated development bypass/mocking strategy only if it cannot accidentally ship as an enabled production bypass.

## Analytics endpoint

`POST /api/events` remains public.

Production edge configuration should apply rate limiting.

## Recommended scripts

The project should expose simple scripts similar to:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:prod
```

Exact commands should be finalized during Sprint 0 based on the installed package versions and Cloudflare configuration.
