<!--
Sync Impact Report (remove before committing)
Version: 1.2.0 → 1.3.0
Modified principles: None
Added sections: VI. Explicit Outcomes and Guard-First Control Flow
Removed sections: None
Follow-up TODOs: None
-->
# Shalinle Constitution

## Core Principles

### I. Feature-Oriented Backend

Backend code MUST be organized into feature slices that keep each feature's actions, domain logic,
and persistence concerns together, with explicit boundaries between slices. Shared code MUST serve
multiple slices or represent a genuinely shared domain concept. This keeps features navigable and
independently testable.

### II. Server Actions as the Application API

Application client-to-server operations MUST use Next.js Server Actions instead of API route
handlers. Actions MUST validate untrusted inputs and enforce authorization where applicable before
calling domain logic. This keeps the application interface consistent and protects server-side work.

### III. Explicit Domain and Type Safety

Untrusted data MUST be validated with Zod before use. TypeScript code MUST NOT use the `any` type;
use precise types or `unknown` with narrowing instead.
Domain concepts defined by their values rather than identity MUST use value objects where applicable,
including validation of their invariants. Type and interface declarations MUST be placed in separate
type files rather than mixed into implementation files. These rules make contracts and domain
invariants explicit.

### IV. Unit, Integration, and End-to-End Tests

Features and behavior changes MUST include unit tests for relevant logic and integration tests for
interactions across boundaries, using Bun's test runner. Bug fixes MUST include a regression test.
User-facing flows MUST be covered by end-to-end tests using Playwright. Tests MUST be maintained
alongside the behavior they cover. This makes isolated rules and cross-component behavior verifiable.

### V. Automated Quality Gates

Code MUST pass Oxlint, Oxfmt checks, TypeScript type checking, and the relevant Bun tests. Husky
pre-commit hooks MUST run the configured pre-commit checks; the full quality gates MUST also be
checked before changes are merged. GitHub Actions MUST run the full quality gates, including
Playwright end-to-end tests, in CI. Automation provides consistent feedback without replacing review.

### VI. Explicit Outcomes and Guard-First Control Flow

Expected business-rule failures MUST be represented as explicit Result values where applicable,
rather than thrown exceptions. Technical failures MUST use exceptions, which MUST be handled at
appropriate boundaries without exposing sensitive details. This distinction makes expected business
outcomes explicit while preserving visibility into technical failures.

Methods MUST perform applicable validation and precondition checks before their intended successful
action, using guard clauses and early returns for failure cases. The successful path MUST remain clear
and follow those checks. Checks that depend on the result of an operation MUST occur after that
operation and before any subsequent action that depends on them. This ordering makes control flow
readable without compromising correctness.

## Technology Constraints

- The application MUST use Next.js and deploy to Vercel.
- Database access MUST use Drizzle ORM with SQLite, compatible with Turso.
- Styling MUST use Tailwind CSS.
- UI components MUST use shadcn/ui and Radix UI.
- Forms MUST use React Hook Form with Zod validation.
- Data visualizations MUST use SVG and D3.js.
- User authentication MUST use next-auth with OpenID Connect (OIDC).
- Logging and error monitoring MUST use Sentry.
- The application API MUST follow the Server Actions principle above.

## Development Workflow

- Feature work MUST respect backend slice boundaries and include the required tests.
- Contributors MUST run the applicable quality gates and address failures before requesting review.
- GitHub Actions CI MUST pass the full quality gates before changes are merged.
- Reviewers MUST check compliance with the constitution and verify that tests cover changed behavior.
- Any necessary exception MUST be documented with its rationale and approved in the change review.

## Governance

This constitution governs project practices and takes precedence over conflicting local conventions.
Amendments MUST document the proposed change, rationale, and any migration impact, and MUST be
approved through the project's normal change-review process before adoption. Compliance MUST be
reviewed for every change; exceptions require the documented approval described above.

Constitution versions use semantic versioning: incompatible principle removals or redefinitions
require a MAJOR increment; new principles, sections, or materially expanded guidance require a MINOR
increment; clarifications and other non-semantic changes require a PATCH increment. The ratification
date records initial adoption, and the last-amended date changes whenever this document is amended.

**Version**: 1.3.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-08
