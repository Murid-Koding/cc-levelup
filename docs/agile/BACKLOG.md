# Product Backlog — CC Level Up! MVP

This backlog is derived from the PRD. It does not replace or modify the PRD.

Items are intentionally implementation-sized only at a high level. Before development, each story should receive task-level acceptance criteria for the current sprint.

## EPIC 1 — Product Foundation

### US-1.1 Project foundation

As a developer, I want a predictable project foundation so that features can be implemented safely and consistently.

Acceptance direction:

- Nuxt 4 project
- locked stack configured
- CI runs core checks
- Cloudflare/D1 development path works

### US-1.2 Database foundation

As a developer, I want the approved domain model represented in D1 so that application features share one consistent source of data.

Acceptance direction:

- PRD entities represented
- constraints and indexes applied
- migrations versioned

## EPIC 2 — Public Session Archive

### US-2.1 Browse sessions

As a visitor, I want to see all published sharing sessions so that I can choose what to watch.

Acceptance direction:

- published only
- newest first
- pagination
- responsive session cards

### US-2.2 Open a session

As a visitor, I want to open a session by slug so that I can understand and watch its content.

Acceptance direction:

- slug URL
- metadata
- description
- summary/transcript
- categories
- speaker
- material link when available
- related sessions

### US-2.3 Play video efficiently

As a visitor, I want video playback to load only when I choose to play it so that the page remains fast.

Acceptance direction:

- YouTube facade
- iframe lazy-created on interaction

## EPIC 3 — Discovery

### US-3.1 Search sessions

As a visitor, I want to search sessions by relevant text so that I can quickly find useful content.

Acceptance direction:

- client-side MVP search
- lightweight index
- no per-keystroke server search

### US-3.2 Filter by category

As a visitor, I want to filter sessions by category so that I can browse by topic.

Acceptance direction:

- multi-category model respected
- shareable/indexable category URL

## EPIC 4 — Upcoming Session

### US-4.1 See upcoming sharing event

As a visitor, I want to see the active Luma event so that I know about the next sharing session.

Acceptance direction:

- Luma embed URL comes from Setting
- empty state when no active embed is configured
- no hardcoded event ID

Note:
CTA wording must follow the product decision for the still-open RSVP question. Do not invent it in implementation.

## EPIC 5 — Admin Content Management

### US-5.1 Manage sessions

As the admin, I want to create, edit, publish, unpublish, and delete session data so that the archive stays current.

Acceptance direction:

- admin APIs under `/api/admin/*`
- validated form
- draft/published state
- speaker
- categories
- YouTube ID/link mapping
- material link
- description
- summary
- slug behavior

### US-5.2 Manage Luma setting

As the admin, I want to update the active Luma embed URL without deploying code.

### US-5.3 Export data

As the admin, I want to export archive data so that the community is not dependent on one platform.

## EPIC 6 — Security

### US-6.1 Protect admin surface

As the owner, I want admin pages and write APIs protected by Cloudflare Access so that unauthorized users cannot mutate archive data.

Acceptance direction:

- `/admin*`
- `/api/admin/*`
- server-side assertion verification for writes

### US-6.2 Protect public analytics ingestion

As the owner, I want public event ingestion rate-limited and validated so that analytics are harder to spam.

## EPIC 7 — Analytics

### US-7.1 Record page views

As the owner, I want session detail page views recorded so that I can compare interest across sessions.

### US-7.2 Record video plays

As the owner, I want video facade clicks recorded so that I have a stronger engagement signal than page views.

Acceptance direction:

- client-side beacon/fetch
- not tied to SSR execution
- event types restricted

### US-7.3 Inspect engagement

As the owner, I want usable counts/ratios for the metrics defined in the PRD.

Do not add a large analytics subsystem beyond what the MVP needs.

## EPIC 8 — SEO and Discoverability

### US-8.1 Search-engine friendly session pages

As a visitor arriving from a search engine, I want useful textual session pages so that I can discover relevant sharing content.

Acceptance direction:

- SSR/indexable content
- session metadata
- VideoObject
- meaningful summary/transcript text

### US-8.2 Sitemap

As a search engine, I need a sitemap containing only published content.

## EPIC 9 — Accessibility and Responsive UX

### US-9.1 Mobile-friendly archive

As a mobile visitor, I want the archive to remain usable on a small screen.

### US-9.2 Keyboard/accessibility baseline

As a visitor using assistive technology or keyboard navigation, I want core controls and content to remain accessible.

## EPIC 10 — About and Operational Pages

### US-10.1 About page

As a visitor, I want to understand the community, how to join/share, and how to request content takedown.

### US-10.2 404 page

As a visitor following a bad URL, I want a clear path back to the archive.

## Deferred / Not MVP

Do not schedule these unless the PRD scope changes:

- viewer accounts/login
- individual learning progress
- certificates/quizzes
- self-hosted video
- file upload for slides
- multi-tenant support
- member submission/approval workflow
- speaker profile pages
- ratings/feedback
- full bilingual content
