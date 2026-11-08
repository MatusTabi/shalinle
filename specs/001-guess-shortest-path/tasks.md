---
description: "Implementation tasks for Guess the Shortest Path"
---

# Tasks: Guess the Shortest Path

**Input**: `specs/001-guess-shortest-path/plan.md`, `spec.md`, `data-model.md`, `research.md`, `contracts/game-actions.md`, and `quickstart.md`.
**Organization**: Story phases are independently verifiable increments; `[P]` marks tasks that can run concurrently at the stated dependency point without editing the same files.

## Phase 1: Setup

- [ ] T001 Add Zod, Sentry, Husky and Playwright dependencies and required scripts to `package.json` and update `bun.lock`; retain Bun 1.4.4 and existing Oxlint/Oxfmt scripts.
- [ ] T002 [P] Document placeholder `SENTRY_DSN` as required in production and optional locally/tests in `.env.example`, and explicitly unignore only that example in `.gitignore`.
- [ ] T003 After T001, configure Husky pre-commit checks in `.husky/pre-commit` and `package.json` and full Bun, typecheck, Oxlint, Oxfmt, build and constitution-required Playwright gates in `.github/workflows/ci.yml`; run an existing Playwright suite if available, add no feature UI or feature-specific E2E test, and record the Playwright gate as unresolved if no suite exists rather than reporting it as passed.

## Phase 2: Foundational prerequisites

**Purpose**: Shared boundaries and infrastructure required by all stories. Read the relevant installed Next.js guides in `node_modules/next/dist/docs/` before implementing Server Actions or instrumentation.

- [ ] T004 [P] Add environment validator tests in `tests/unit/server-env.test.ts` for missing, empty and malformed production DSNs, valid DSN, absent local/test DSN and sanitized errors; add isolated startup validation cases without network calls in `tests/integration/server-startup.test.ts`.
- [ ] T005 After T001 and T004, implement server-only Zod environment validation in `src/config/server-env.ts` and initialize Sentry at the server startup boundary in `src/instrumentation.ts`; disable monitoring when optional DSN is absent, never log values and do not require an upload token.
- [ ] T006 [P] Define public serializable action inputs, outputs, snapshots, Result and the six error codes from `contracts/game-actions.md` in `src/features/shortest-path/types/game.ts`: identifiers are "nonempty strings"; attempt has "nonnegative revision, and active/completed status"; counts and revisions are integers.
- [ ] T007 After T001 and T006, implement Zod input schemas and fixed, non-sensitive business-error helpers in `src/features/shortest-path/actions/validation.ts`; require nonempty identifiers and a nonnegative integer `expectedRevision`, with no submitted identifiers in errors.
- [ ] T008 After T005, implement an action-boundary technical failure handler in `src/features/shortest-path/actions/technical-error.ts` that reports exceptions to Sentry without secrets, attempt IDs or guess histories and throws a sanitized exception instead of a business Result; never expose raw errors or stack traces.

**Checkpoint**: Shared configuration and contracts are ready. Tests in each story can be written before its implementation.

## Phase 3: User Story 1 — Obtain a Playable Challenge (P1) 🎯 MVP

**Goal**: Expose a solvable sample challenge without revealing connections or its answer.
**Independent test**: Request the challenge and check its endpoint names and complete stop list, no connections or shortest length, and independently verify distinct endpoints and a shortest route of at least five hops.

### Tests

- [ ] T009 [P] [US1] Add directed BFS and challenge eligibility unit checks in `tests/unit/shortest-path-graph.test.ts`, including tied shortest paths, unreachable endpoints, identical endpoints and shortest distances below five hops.
- [ ] T010 [P] [US1] Add retrieval contract integration checks in `tests/integration/challenge-actions.test.ts` for the public stop projection, hidden graph/answer, endpoint entries and independently computed solvability.

### Implementation

- [ ] T011 [P] [US1] Define graph and challenge types in `src/features/shortest-path/types/network.ts`: Stop has "stable nonempty identifier and display name, unique within the network"; directed connection is an "ordered pair of existing stop identifiers", "Each connection has cost one"; challenge has a "stable identifier", "Endpoints are distinct and known", and "The terminal must be reachable in at least five hops".
- [ ] T012 [US1] Implement immutable sample stops, directed connections and one stable challenge with tied routes and at least five shortest hops in `src/features/shortest-path/data/sample-network.ts` using T011's types; keep the graph server-private.
- [ ] T013 [US1] Implement forward and reversed directed BFS and eligibility guards in `src/features/shortest-path/domain/graph.ts`; reject identical, unknown, unreachable or fewer-than-five-hop endpoints and retain distances privately.
- [ ] T014 [US1] Implement the no-argument `getChallenge` Server Action in `src/features/shortest-path/actions/challenge.ts`, using T012–T013 and T008 to return the contract projection or unavailable result without connections, answer or exact minimum.

**Checkpoint**: Challenge retrieval is independently usable without implementing an attempt.

## Phase 4: User Story 2 — Guess Stops and Complete a Route (P1)

**Goal**: Start isolated attempts, record one guess at a time and return completion and progress results.
**Independent test**: Start separate attempts, build shortest and longer routes, submit invalid and unconnected stops, retrieve ordered progress and verify both marks, revisions and final outcomes.

### Tests

- [ ] T015 [P] [US2] Add graph-position and transition unit cases in `tests/unit/shortest-path-attempt.test.ts` for tied shortest paths, both marks in all four combinations, detours, repeats, positions beyond the shortest route, dead ends, unconnected terminal, unknown stops and shortest/longer completions.
- [ ] T016 [P] [US2] Add isolated-store Server Action integration cases in `tests/integration/attempt-actions.test.ts` for start, progress, independent attempts, malformed input, unknown stop, completed attempts, state unchanged on rejection, stale snapshot, competing revisions, lost response recovery and process-local attempt loss.
- [ ] T017 [P] [US2] Add atomic repository tests in `tests/unit/attempt-repository.test.ts` proving simultaneous same-revision guesses cannot both commit and injected precommit technical failure leaves the entire snapshot unchanged.

### Implementation

- [ ] T018 [US2] Define internal attempt state and transition types in `src/features/shortest-path/types/attempt.ts`, importing shared public types from `src/features/shortest-path/types/game.ts` where appropriate instead of duplicating them: "Starts active at revision 0 with route `[start]`, no guesses and current stop equal to start"; guess has "proposed one-based position, connected boolean, and optimal-position boolean"; "All known guesses, including repeats and unconnected guesses, are recorded in order"; completion "Exists only after a connected guess reaches the terminal".
- [ ] T019 [US2] Implement a process-local attempt repository with opaque unique IDs, isolated snapshots and synchronous compare-and-commit in `src/features/shortest-path/data/attempt-repository.ts`; a failed transition or exception before commit must leave all state unchanged, and missing attempts are unavailable.
- [ ] T020 [US2] Implement pure attempt transitions in `src/features/shortest-path/domain/attempt.ts`: proposed position follows accepted route, marks are independent and use `ds[v] = p - 1` and `ds[v] + dt[v] = D`, record every known guess and increment revision, advance only on a directed connection, and compute completion hop counts without counting unconnected guesses.
- [ ] T021 [US2] Implement start, retrieval and guess orchestration and conversion from internal state to public snapshots in `src/features/shortest-path/domain/game-service.ts` using T013, T019 and T020; enforce validation-before-mutation, stale snapshots, completed and unknown-stop rejection, and atomic revision checks without an async gap.
- [ ] T022 [US2] Implement serializable `startAttempt`, `getAttempt` and `guessStop` Server Actions in `src/features/shortest-path/actions/attempt.ts` using T007, T008 and T021; match `contracts/game-actions.md` and never expose graph or minimum before completion.

**Checkpoint**: The complete normal game loop is independently testable in one process; ephemeral state provides no ownership or cross-instance guarantee.

## Phase 5: User Story 3 — Handle Unavailable Challenges (P2)

**Goal**: Give clear unavailable outcomes and sanitized technical failures without mutating attempts.
**Independent test**: Exercise unknown, disconnected, identical-endpoint and too-short challenges, an attempt whose challenge disappears, and an injected technical failure; check outcomes and unchanged state.

### Tests

- [ ] T023 [P] [US3] Add unavailable-challenge and error-precedence integration cases in `tests/integration/unavailable-challenge.test.ts`: validation → unavailable attempt → unavailable challenge → stale → completed → unknown stop, with complete unchanged snapshots.
- [ ] T024 [P] [US3] Add sanitized technical-failure and precommit fault integration checks in `tests/integration/game-failure.test.ts`, verifying Sentry reporting excludes private state, actions throw sanitized exceptions rather than business Results, and raw errors and stack traces are not exposed.

### Implementation

- [ ] T025 [US3] Extend challenge lookup and eligibility handling in `src/features/shortest-path/domain/game-service.ts` to return `CHALLENGE_UNAVAILABLE` for unknown or ineligible challenges on start and on guess, before stale/completed/unknown-stop checks and without mutation.
- [ ] T026 [US3] Integrate and verify sanitized exception handling for challenge and attempt actions in `src/features/shortest-path/actions/challenge.ts` and `src/features/shortest-path/actions/attempt.ts`; throw sanitized technical exceptions rather than explicit business Results and never expose raw errors or stack traces.

**Checkpoint**: Unavailable scenarios and competing failures are independently verifiable using isolated fixtures.

## Phase 6: Polish & cross-cutting concerns

- [ ] T027 [P] Update `specs/001-guess-shortest-path/quickstart.md` with actual action imports, commands, ephemeral storage/access limitations and the retrieve-before-retry rule if implementation differs from the design.
- [ ] T028 Run the complete acceptance checklist in `specs/001-guess-shortest-path/quickstart.md` and the Bun, typecheck, lint, format, build and constitution-required Playwright gates from `package.json`; fix failures in the relevant files and record an absent Playwright suite as an unresolved gate, not a pass, without adding a feature UI or feature-specific E2E test.
- [ ] T029 Review `src/features/shortest-path/`, `src/config/server-env.ts` and `.github/workflows/ci.yml` against `.specify/memory/constitution.md`, especially separate type files, no `any`, Sentry sanitization and no routes, frontend or persistence.

## Dependencies & execution order

Phase 1 → Phase 2 → US1 → US2 → US3 → Polish. US1 and US2 both have P1 priority; US2 needs US1's network and analysis, and US3 extends their service/action behavior. US3 tests can be authored after the foundational contracts, but integration implementation depends on US2. T003 requires T001; T005 requires T001 and T004; T007 requires T001 and T006; T008 requires T005. Author each story's tests, run them and confirm they fail for the expected missing behavior before starting that story's implementation; independent implementation tasks may then run in parallel. No feature-specific frontend E2E test is required.

### Parallel examples

- **US1**: After the foundation, author T009 and T010 in parallel and confirm the expected failures; then T011 → T012 and T013 (parallel after T011) → T014.
- **US2**: After US1, author T015, T016 and T017 in parallel and confirm the expected failures; then T018 → T019 and T020 (parallel after T018) → T021 → T022.
- **US3**: After the foundation, author T023 and T024 in parallel; after US2, confirm the expected failures, then implement T025 followed by T026 and rerun both suites.
- T002 can run alongside T001; T004 and T006 can run in parallel after setup; T027 can run alongside other final verification work provided it does not edit the same files.

## Implementation strategy

1. Deliver the MVP by completing setup, foundation and US1; validate challenge retrieval on its own.
2. Add US2 for the full playable server-side loop and validate its acceptance matrix in isolation.
3. Add US3 failure handling and precedence, then run the cross-cutting gates and constitution review.
4. Keep all storage ephemeral, avoid a frontend and durable database, and retrieve progress before retrying an ambiguous guess response.
