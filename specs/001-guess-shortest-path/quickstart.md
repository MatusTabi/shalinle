# Quickstart: Validate the Game Backend

This is a guide for **after implementation**; the game actions and tests described here do not
exist yet. It does not require a frontend, database, real transit data, or user account.

## Prerequisites and setup

- Install the repository's Bun version (1.4.4) and dependencies with `bun install`.
- Copy `.env.example` to `.env` for local configuration. Leave the documented optional local
  `SENTRY_DSN` unset to disable monitoring, or supply a valid DSN; do not commit `.env`.
  Production runtime requires `SENTRY_DSN`, provisioned through Vercel environment settings.
  Local tests must not require monitoring credentials or network access. Next test mode does not
  load `.env.local`; standalone tests should set explicit fixture values instead of relying on it.
- Request the predefined challenge without an identifier and use its returned identifier to start
  an attempt, as described in the [action contract](contracts/game-actions.md).

## Automated verification

Run from the repository root after the implementation and its test suite are present:

```sh
bun test
bun run typecheck
bun run lint
bun run format:check
bun run build
```

All commands should exit successfully. Run the project's configured Playwright CI gate as well;
no new end-user flow is added in this phase. CI and Husky setup must conform to the constitution.
Environment validation tests must cover missing, empty and malformed production `SENTRY_DSN`, a
valid DSN, and absent local/test configuration; failure messages must not reveal supplied values.
Run production-start validation in an isolated process with an invalid or missing DSN and expect a
sanitized startup failure before requests; repeat with a valid non-secret fixture and expect the
configuration check to pass without making external network calls.

## Acceptance scenarios

Exercise the action/service boundary through the integration tests, in one server process:

1. Fetch the sample challenge; verify distinct endpoints, at least six stops on the independently
   computed shortest route, a selection list, and no connections or exact solution in the response.
2. Start two attempts and submit known stops one at a time. Check their independent histories,
   connected and unconnected classifications, revision increments, and tie-aware optimal marks.
3. Complete shortest and longer routes; verify the hop counts and shortest flag. Verify an
   unconnected guess remains in history without affecting the route or shortest classification.
4. Test unknown stops, malformed identifiers, unavailable/too-short challenges, stale revisions,
   and guesses after completion. Confirm errors and that no attempt state changes on rejection.
5. Simulate loss of process-local attempt data; retrieval must report unavailable and allow a new
   attempt. Do not interpret this check as a multi-instance durability guarantee.
6. Exercise an unavailable challenge associated with an attempt and competing error conditions;
   verify challenge unavailability takes precedence over stale, completed, and unknown-stop outcomes.
7. Inject a technical failure before a guess commits and verify the full attempt remains unchanged.
   Simulate a lost response after commit and verify the client retrieves progress before any retry.

Run directed graph and concurrency edge cases listed in [research.md](research.md); exercise
tests with isolated fixture stores rather than relying on execution order or shared state.
