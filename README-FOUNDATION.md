# CC Level Up! — Engineering Foundation Pack

This pack contains technical and agile foundation documents for implementing the existing PRD without modifying it.

## Included

```text
AGENTS.md
docs/
  architecture/
    ARCHITECTURE.md
  adr/
    001-foundation-stack.md
  agile/
    BACKLOG.md
    DEFINITION_OF_DONE.md
    SPRINTS.md
  development/
    ENVIRONMENT.md
.github/
  workflows/
    ci.yml
```

## Recommended repository placement

Keep the approved PRD separately as the immutable product source of truth, for example:

```text
docs/product/PRD.md
```

Do not edit the PRD as part of applying this foundation pack.

## Suggested next step

Start with Sprint 0 only.

The first coding-agent task should bootstrap the project and tooling. Do not ask the agent to implement product features until the foundation build, D1 connection, migrations, and CI are working.
