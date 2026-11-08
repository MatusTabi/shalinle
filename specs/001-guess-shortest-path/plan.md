# Implementation Plan: Guess the Shortest Path

**Branch**: `001-guess-shortest-path` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-guess-shortest-path/spec.md`

## Summary

Build a server-only feature slice that exposes challenge retrieval and anonymous, incremental
attempts through Server Actions. A directed in-memory sample network supports at least one
challenge whose shortest path has five or more edges. Classify each known guess independently by
connectivity and position on any shortest path; preserve unconnected guesses in history, and
evaluate the accepted route on reaching the terminal. Use ephemeral process-local attempts with
optimistic version checks; unavailable attempts require starting again.

## Technical Context

**Language/Version**: TypeScript, strict mode; existing ES2017 target; Bun 1.4.4 package manager.

**Primary Dependencies**: Next.js 16.4.4, React 19.3.0; add Zod for input validation and Sentry
for logging/error monitoring as required by the constitution. Use existing Oxlint and Oxfmt.

**Storage**: Process-local in-memory immutable sample graph and transient attempt repository;
no database in this phase. If persistence is added later, use Drizzle with Turso-compatible SQLite.

**Testing**: Bun unit and integration tests; typecheck, Oxlint and Oxfmt; GitHub Actions full
quality gates, including Playwright, per constitution. No user-facing flow is added in this phase.

**Target Platform**: Next.js server runtime, local development and Vercel deployment.

**Project Type**: Next.js web application, backend-only feature slice.

**Performance Goals**: No production latency or throughput SLA for the sample phase; graph
evaluation uses linear-time breadth-first traversals in graph size.

**Constraints**: No route handlers, frontend, durable game storage, real transit data or user
authentication. State can disappear across instances or restarts; no access-control guarantee.
Each request is validated and stale attempt revisions must not mutate state. Secrets belong in
ignored `.env` files locally and deployment environment settings on Vercel, never source control.
Provide a committed `.env.example` and validate required environment variables with Zod.
Require a valid server-side `SENTRY_DSN` in production runtime; allow it to be absent locally and
in tests, where monitoring is disabled. Validate any supplied DSN and do not require an upload
token unless a source-map upload integration is later configured.

**Scale/Scope**: One predefined sample challenge and a small finite graph; no production-scale
concurrency or availability guarantee. Repeated guesses and routes are not artificially capped.

## Constitution Check

**Pre-research: PASS, conditional on implementation and CI gates below.**

- Feature-oriented backend: isolate domain, actions and in-memory repository within one slice.
- Server Actions: all frontend-facing operations are Server Actions; no API route handlers.
- Validate all untrusted inputs using Zod; no `any`; use value objects where justified and place
  type declarations in separate files.
- Bun unit and integration tests cover behavior and boundaries. No new user-facing flow exists;
  Playwright applies when one is added. Full CI gates include Playwright as constitution requires.
- Use Oxlint, Oxfmt, typecheck, Bun tests, Husky pre-commit hooks and GitHub Actions gates. Existing
  package scripts do not establish Husky or CI; these must be added or verified during implementation.
- Sentry is required for logging and error monitoring; avoid logging guess histories or attempt IDs.
- Expected business failures use explicit Results; technical failures use exceptions handled at
  appropriate boundaries without exposing sensitive details. Validate and check preconditions with
  guard clauses before successful work; check operation-dependent conditions before dependent work.
- Document all required environment variables in `.env.example` without real credentials; use a
  server-only Zod validator and test missing, empty and malformed values without leaking secrets.
- No database access, UI, forms, visualizations or authentication is introduced; respective stack
  requirements apply when these are added. Authentication later must use next-auth with OIDC.
- Vercel and the sample's process-local state imply no cross-instance durability; this explicit
  spec limitation is not a claim of production-ready session continuity or privacy.

**Post-design: PASS conditionally.** Contracts preserve Server Actions, explicit business Results,
guard-first checks and sanitized technical failures; environment validation, testing/CI and Sentry
remain implementation deliverables, not completed gates. Recheck compliance during implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-guess-shortest-path/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── game-actions.md
```

### Source Code (repository root)

```text
src/
├── app/                         # existing Next.js application; no new UI required
├── config/                      # server-only validated environment configuration
└── features/shortest-path/      # proposed slice
    ├── actions/                 # public Server Actions and input schemas
    ├── domain/                  # graph analysis, attempt transitions and value objects
    ├── data/                    # sample graph and in-memory attempt repository
    └── types/                   # shared slice type declarations
tests/
├── unit/                        # domain and validation cases
└── integration/                 # action/service/repository behavior
```

At the repository root, add `.env.example` containing placeholders and explicitly unignore it in
`.gitignore`; keep real `.env*` files ignored. Do not commit credentials.

**Structure Decision**: Keep related code in one feature slice under the existing `src/` layout;
paths are proposed and may be adjusted for existing conventions during implementation.

## Complexity Tracking

No constitution violations or exceptions are proposed. Temporary in-memory storage is explicitly
required by the feature and does not invoke the database technology constraint.
