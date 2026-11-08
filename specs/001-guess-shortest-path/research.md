# Research: Guess the Shortest Path

This research supports [the feature specification](spec.md) and [implementation plan](plan.md).
Decisions below apply to the sample phase, not a production availability or security guarantee.

## Directed shortest-path analysis

**Decision:** Represent connections as directed, unweighted edges. Run breadth-first search (BFS)
from the start to compute `ds`, and BFS from the terminal over reversed edges to compute `dt`.
Let `D = ds[terminal]` be the shortest distance in connections. A stop `v` is optimal at proposed
one-based position `p` exactly when `ds[v] = p - 1` and `ds[v] + dt[v] = D`, with both distances
finite. Reject a challenge when its endpoints coincide, the terminal is unreachable, or `D < 5`.

**Rationale:** BFS gives minimum hop counts in a directed unweighted graph. The two distance maps
identify every tied shortest route without enumerating paths. Position is one after the accepted
route's last position, even after detours; the optimal mark is independent of whether the current
stop connects to the guess. Each traversal is O(V + E). Only completion reveals `D` and the
accepted route's connection count; challenge and in-progress responses omit the graph and exact
minimum.

**Alternatives:** Enumerating shortest routes can grow exponentially and is unnecessary; retaining
one canonical path would misclassify ties. Weighted shortest-path algorithms add complexity without
serving the hop-count specification. Traversing original edges backward from the terminal would be
incorrect for directed connections.

## Action boundaries and validation

**Decision:** Expose challenge retrieval, attempt creation, progress retrieval, and guessing through
Server Actions, with Zod validation at each untrusted input boundary. Return explicit, React-
serializable outcomes for expected validation, unavailable, completed, and stale-revision cases;
do not return raw internal graph or repository objects. Keep domain logic and action wiring separate.

**Rationale:** The constitution requires Server Actions and Zod. The installed Next.js guides
recommend server-side schema validation, treating actions as untrusted entry points, constraining
serialized returns, and modeling expected failures as return values. A form action receives
`FormData`; if a future form uses `useActionState`, its action receives previous state first.

**Alternatives:** Route Handlers conflict with the current constitution and plan. Client-only
validation cannot protect the action boundary. Exceptions for ordinary invalid or stale requests
make expected outcomes less explicit.

**Local official sources:** [Forms, validation](../../node_modules/next/dist/docs/01-app/02-guides/forms.md#L129),
[Server Actions, security](../../node_modules/next/dist/docs/01-app/02-guides/server-actions.md#L76),
[Error handling](../../node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md#L15),
[client boundary serialization](../../node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md#L298).

## Attempt state and concurrency

**Decision:** Store separate attempts in process-local memory with an optimistic revision supplied
on each guess. Atomically compare the revision and apply the entire transition within the owning
instance, without an asynchronous gap between check and update. Increment the revision for every
recorded known guess, including an unconnected guess; stale or invalid guesses do not change state.
On conflict return a stale outcome and latest progress, or make that progress retrievable. Completed
attempts reject further guesses.

**Rationale:** Unconnected guesses modify history even though the route does not advance, so they
must invalidate competing requests too. Client-side Server Action dispatch is sequential per client,
but the server does not queue requests, so it cannot provide the required concurrency protection.

**Alternatives:** Relying on client sequencing does not protect concurrent requests. A distributed
transaction or durable store would provide broader coordination but is outside this phase. Instance-
local revision checks do not coordinate separate processes.

**Local official source:** [Server Actions, sequential dispatch](../../node_modules/next/dist/docs/01-app/02-guides/server-actions.md#L26).

## Vercel runtime and security scope

**Decision:** Target the default Node.js runtime on Vercel. Treat attempts as ephemeral and local to
one running instance: a restart or request routed to another instance may make an attempt unavailable,
in which case the player starts again. Do not add durable persistence or claim session continuity.
Authentication and attempt access control are explicitly deferred; no privacy or ownership guarantee
is implied. Still validate all inputs and avoid exposing internal data or sensitive diagnostics.

**Rationale:** The spec explicitly allows instance-local loss and defers access control. Next.js
documents ephemeral, per-instance serverless storage and warns that action endpoints are reachable
by POST. Its default action request body limit is 1 MB; allowlisted proxy origins and body limits
are configurable if actually needed. Deployment platforms can enforce execution limits, and page-
level `maxDuration` affects actions used there; no particular platform limit or SLA is assumed.
Action IDs may change after deployment, so clients should be able to refresh and retry.

**Alternatives:** A shared durable store or authentication would address different production needs
but exceed the agreed scope. Edge runtime is deprecated in the installed documentation; do not opt
into it. Framework CSRF checks and opaque action references are not authorization.

**Local official sources:** [Runtime](../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/runtime.md#L18),
[ephemeral storage](../../node_modules/next/dist/docs/01-app/02-guides/self-hosting.md#L109),
[action security and limits](../../node_modules/next/dist/docs/01-app/02-guides/server-actions.md#L76),
[maxDuration](../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/maxDuration.md#L6),
[deployment transitions](../../node_modules/next/dist/docs/01-app/02-guides/server-actions.md#L172).

## Observability and verification

**Decision:** Use Sentry for logging and error monitoring, without logging guess histories or attempt
IDs. Add Bun unit and integration tests covering graph ties and direction, positional marks,
validation, state transitions, and competing revisions. Run Oxlint, Oxfmt checks, type checking,
and relevant Bun tests; configure Husky pre-commit checks and GitHub Actions full quality gates,
including Playwright. No new user-facing flow exists in this phase; add Playwright coverage when
one does. These are implementation deliverables, not claims that the gates already pass.

**Rationale:** [Constitution v1.3.0](../../.specify/memory/constitution.md) mandates Sentry,
unit and integration tests, user-facing end-to-end coverage, pre-commit checks, and full CI gates.
The sample phase specifies no production latency, throughput, or availability SLA.

**Alternatives:** Deferring CI or replacing Sentry with another logging system conflicts with the
constitution. Inventing a frontend solely to create an end-to-end feature flow exceeds the scope.

## Outcomes and guard-first control flow

**Decision:** Return explicit Results for expected business failures at domain and action boundaries.
Use exceptions for technical failures, handled at appropriate boundaries with sanitized reporting.
Apply validation and precondition guards before success actions and operation-dependent checks before
subsequent work. In particular, check revisions and other failure conditions before any mutation.

**Rationale:** Constitution v1.3.0 makes the distinction and control-flow ordering mandatory;
atomic revision checks also protect the attempt's state.

**Alternatives:** Throwing for ordinary rejected guesses obscures expected outcomes; catching every
exception as a business failure would hide operational errors.

## Environment configuration and secrets

**Decision:** Keep local secrets in root `.env` (ignored by Git), and provision deployment secrets
through Vercel environment settings. Commit `.env.example` with a placeholder `SENTRY_DSN` and
an explanation that it is required for production runtime, optional locally and in tests. Use a
server-only Zod schema: reject missing or empty production DSNs and reject malformed values whenever
provided; disable monitoring when the optional value is absent. Validate at the server initialization
boundary before requests, and expose a testable validator for standalone Bun tests. Do not log values.
No source-map upload is in scope, so do not require an authentication token for it. If later added,
document and validate its build-only credentials separately. Explicitly unignore `.env.example`.

**Rationale:** Sentry monitoring is mandated, but local unit and integration tests must not depend on
external credentials or network access. Next.js loads root `.env` files; `instrumentation.ts`'s
`register` runs before an instance handles requests. Standalone tests do not run that hook, and
Next.js test mode skips `.env.local`. Environment values supplied by the process take precedence.
Secrets must not be placed in `next.config.ts`'s `env` or exposed through `NEXT_PUBLIC_`.

**Alternatives:** Hardcoded credentials or committed `.env` files expose secrets. Requiring production
credentials for every import or test makes offline verification brittle. Silently accepting an invalid
production configuration hides an operational failure.

**Local official sources:** [Environment variables](../../node_modules/next/dist/docs/01-app/02-guides/environment-variables.md),
[instrumentation](../../node_modules/next/dist/docs/01-app/02-guides/instrumentation.md),
[next.config env exposure](../../node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/env.md).
