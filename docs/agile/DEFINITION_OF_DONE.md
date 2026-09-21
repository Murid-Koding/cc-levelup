# Definition of Done — CC Level Up!

A backlog item is DONE only when all relevant conditions below are satisfied.

## Product

- Acceptance criteria are satisfied.
- Behavior does not contradict the PRD.
- No new product decision has been silently introduced.
- Only intended scope is included.

## Code

- TypeScript/typecheck passes.
- ESLint passes.
- Formatting is clean.
- No unrelated refactor is bundled into the item.
- No unnecessary dependency was added.
- Code follows the repository architecture and AGENTS.md.

## Data

- Server input is validated.
- Database schema changes include a reviewed migration.
- Public queries do not expose draft sessions.
- Relevant indexes/constraints are preserved.

## UX

Where applicable:

- loading state exists
- error state exists
- empty state exists
- responsive layout has been considered
- keyboard/accessibility behavior has been considered
- PrimeVue/UnoCSS conventions are followed

## SEO

For public indexable pages, where applicable:

- server-rendered/indexable content is preserved
- metadata is correct
- draft content is excluded
- structured data/sitemap behavior remains valid

## Security

Where applicable:

- admin mutations remain under `/api/admin/*`
- admin endpoints verify expected access context
- public endpoint payloads are validated
- secrets are not exposed or committed
- analytics endpoint assumptions remain safe

## Testing

- Relevant Vitest tests pass.
- Relevant Playwright critical flow passes when affected.
- Regression tests are added when the item fixes a meaningful bug.

No target of 100% test coverage is required.

## Build

- Production build passes.
- No environment-specific secret or machine-only file is committed.

## Documentation

Update documentation only when the implementation changes:

- architecture decisions
- environment setup
- developer workflow

Do not edit the PRD as part of technical implementation.
