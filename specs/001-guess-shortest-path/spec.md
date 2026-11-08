# Feature Specification: Guess the Shortest Path

**Feature Branch**: `feat/server-scaffold`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Develop Shalinle, a guess-like game, where users will guess shortest path from start to terminal stop. Implement server side for now. Use in-memory sample data for this first phase. Implement neccessary API for future integration with the frontend."

**Amendment**: Players guess one stop at a time.

**Amendment**: Record and classify each known stop guess for a future map; the shortest route
contains at least six stops, including both endpoints.

## Clarifications

### Session 2026-11-07

- Q: Should players receive the full network of stops and connections before guessing? → A: List all stop names for selection, but reveal connectivity only through guesses.
- Q: Should unconnected guesses affect whether a completed attempt is considered shortest? → A: No; only the accepted route's connection count determines whether it is shortest.
- Q: How should access to an anonymous attempt be controlled? → A: Access control is deferred; authentication will be handled later.
- Q: What should happen if an attempt cannot be found because a later request reaches a different running instance? → A: Report the attempt as unavailable; the player starts a new attempt.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Obtain a Playable Challenge (Priority: P1)

As a player using a future client, I want a starting stop and a terminal stop so that I can
guess a route between them.

**Why this priority**: A clear, solvable challenge is needed before a guess can be made.

**Independent Test**: Request the sample challenge and verify its endpoints and available stops
are listed without revealing connections; independently verify that the challenge is solvable.

**Acceptance Scenarios**:

1. **Given** sample network data is available, **When** a challenge is requested, **Then**
   the response identifies the challenge, start, terminal, and all stops available for selection,
   but does not disclose the network's connections.
2. **Given** a challenge is returned, **When** its details are inspected before completion,
   **Then** the complete shortest-path answer and its exact length are not disclosed.
3. **Given** sample network data, **When** a challenge is offered, **Then** its shortest route
   contains at least six stops, including the start and terminal.

### User Story 2 - Guess Stops and Complete a Route (Priority: P1)

As a player, I want to guess one stop at a time and learn whether my completed route is
shortest so that I can build and assess my route as I play.

**Why this priority**: Evaluating a route is the central game interaction.

**Independent Test**: Start separate attempts and submit one stop at a time to build shortest
and longer routes; submit invalid stops and verify the progress and final results.

**Acceptance Scenarios**:

1. **Given** a new attempt, **When** play begins, **Then** its route contains only the start
   stop and its current stop is the start.
2. **Given** an active attempt, **When** a connected next stop is guessed, **Then** it is
   appended to that attempt's route and returned with its connectivity and optimal-position marks.
3. **Given** an active attempt, **When** a known unconnected stop is guessed, **Then** it is
   recorded and returned as unconnected with its optimal-position mark, while the route and
   current stop remain unchanged.
4. **Given** an active attempt, **When** a valid guess reaches the terminal, **Then** the
   attempt completes and returns its length, the minimum length, and whether it is shortest;
   all tied shortest routes are accepted.
5. **Given** a completed attempt, **When** another stop is guessed for it, **Then** the guess
   is rejected and the completed route and result remain unchanged.
6. **Given** multiple shortest routes, **When** a stop appears at the proposed position in any
   one of them, **Then** it is marked as being at an optimal position, even after a detour.
7. **Given** an unknown stop, **When** it is guessed, **Then** it is rejected with a reason and
   neither the route nor guess history changes.
8. **Given** an attempt with recorded guesses, **When** its progress is retrieved, **Then**
   the ordered guess history includes each known guessed stop and both marks.

### User Story 3 - Handle Unavailable Challenges (Priority: P2)

As a future client integrator, I want clear outcomes for unavailable or unsolvable challenges
so that players are not presented with an impossible game.

**Why this priority**: Predictable failure handling makes the game usable beyond the happy path.

**Independent Test**: Start an attempt with an unknown challenge and exercise a network with disconnected
endpoints; verify that both are reported without accepting a guess or claiming a solution.

**Acceptance Scenarios**:

1. **Given** an unknown challenge identifier, **When** an attempt is started with that identifier,
   **Then** the operation reports that the challenge is unavailable.
2. **Given** a challenge whose endpoints have no connecting route, **When** it is requested,
   **Then** it is reported as unavailable rather than offered as playable.
3. **Given** an unexpected technical failure, **When** a game operation cannot be completed,
   **Then** the client is informed that the operation failed without receiving sensitive details
   or a misleading game-rule rejection.
4. **Given** an existing attempt whose challenge is unavailable, **When** a stop is guessed for
   that attempt, **Then** the operation reports that the challenge is unavailable and does not
   change the attempt.

### Edge Cases

- Connections are directional: a reverse traversal is valid only if explicitly present.
- Repeated stops are allowed in a connected route, but each traversed connection counts.
- Multiple shortest routes are equally correct; no single canonical answer is required.
- A guess's proposed position is the next position in the accepted route, counting the start as
  position one. Unconnected guesses do not advance that position; repeated guesses remain in history.
- A connected stop may be off the optimal position, and an unconnected stop may be at an optimal
  position; connectivity and optimal-position marks are independent.
- Unconnected guesses remain in history but do not affect the accepted route's length or whether
  a completed route is shortest.
- If the proposed position exceeds the length of every shortest route, the stop is not at an
  optimal position. Guessing the terminal completes an attempt only if it is connected.
- Missing or malformed challenge, attempt, or stop identifiers are rejected with a clear reason.
- Unknown or expired attempts are reported as unavailable; separate attempts do not share progress.
- A valid next stop that leads to a dead end is accepted; the player may start a new attempt.
- Two guesses against the same prior attempt state cannot both advance that state; a stale guess
  is rejected without changing the route, and the latest progress is available to the client.
- A guess transition commits in full or leaves the attempt unchanged, including on an unexpected
  technical failure before commit. If a guess response is not definitive, the client retrieves the
  latest progress before deciding whether to retry and uses the retrieved revision for any retry.
- A challenge with identical endpoints is not offered in this phase.
- Sample data and any transient state may reset when the running service restarts; no player
  progress is promised across restarts or separate service instances. If an attempt is not found,
  report it as unavailable and allow the player to start a new attempt.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide at least one predefined, solvable challenge based on
  in-memory sample network data, with distinct start and terminal stops. Every offered challenge's
  shortest route MUST contain at least six stops including both endpoints (at least five connections).
- **FR-002**: The system MUST allow a future client to request the predefined challenge without
  supplying a challenge identifier. The returned details MUST include a stable challenge identifier,
  start and terminal stop identifiers and names, and the available stop identifiers and names.
  Challenge details MUST NOT disclose directed connections; the connectivity of a guessed stop is
  disclosed through its guess result.
- **FR-003**: Challenge details and in-progress feedback MUST NOT disclose a complete shortest
  route or its exact length before an attempt completes; per-guess marks are permitted.
- **FR-004**: The system MUST allow a player to start an independent attempt for an available
  challenge and return an attempt identifier, its route initialized to the start stop, its current
  stop, and its active status.
- **FR-005**: The system MUST accept one known stop identifier per guess for an active attempt,
  including a stop with no directed connection from the current stop.
- **FR-006**: The system MUST reject malformed inputs and unknown stops with a reason that
  distinguishes them from unavailable challenges or attempts. Rejected guesses MUST NOT change
  the route or guess history; the player MUST be able to continue the active attempt.
- **FR-007**: Each known guess MUST be recorded and returned with its stop identifier, connectivity
  to the current stop, and optimal-position mark. A connected guess MUST be appended to the route
  and become the current stop; an unconnected guess MUST leave both unchanged. The response MUST
  include the updated route, current stop, and status. Upon reaching the terminal by a connected
  guess, the system MUST complete the attempt and calculate its traversed connection count.
- **FR-008**: On completion, the system MUST compare the route length with the minimum and
  identify every minimum-length route as shortest and longer routes as not shortest. The result
  MUST include both lengths. Unconnected guesses MUST NOT affect this classification. Completed
  attempts MUST reject further guesses without changes.
- **FR-009**: The system MUST report an unknown or unsolvable challenge as unavailable and MUST
  NOT evaluate guesses against it as though it were playable. A guess for an attempt whose challenge
  is unavailable MUST report the challenge as unavailable without changing the attempt.
- **FR-010**: The system MUST expose challenge retrieval, attempt creation, progress retrieval,
  and single-stop guessing to a future frontend without requiring a frontend in this phase.
- **FR-011**: This phase MUST use in-memory sample data and MUST NOT require persistent game
  storage, real transit data, player accounts, or a deployed frontend.
- **FR-012**: The system MUST keep each attempt's progress separate, allow its current progress
  including ordered known-guess history and marks, and completion result to be retrieved using its
  identifier, and report unknown or expired attempts as unavailable.
- **FR-013**: The system MUST reject a guess made against an outdated attempt state without
  changing progress and make the latest progress available so the player can retry.
- **FR-014**: The optimal-position mark MUST indicate whether the guessed stop occurs at the
  proposed position in at least one shortest route from the challenge start to its terminal.
  The proposed position is one after the current accepted route's last position, with the start
  at position one. This mark MUST be independent of connectivity and the preceding guessed route.
- **FR-015**: A challenge that does not meet the minimum shortest-route length in FR-001 MUST be
  reported as unavailable.
- **FR-016**: Expected game-rule failures MUST have explicit outcomes distinguishable from
  unexpected technical failures. Technical failures MUST be handled without exposing sensitive
  details to the client or presenting the failure as a game-rule rejection.

### Key Entities _(include if feature involves data)_

- **Stop**: A named location with a unique identifier within the sample network.
- **Connection**: A permitted directed traversal from one stop to another; each counts as one hop.
- **Challenge**: An identifiable pair of distinct start and terminal stops in a network with at
  least one route between them.
- **Attempt**: An independent playthrough with an identifier, challenge, ordered route, current
  stop, and active or completed status.
- **Guess**: One known proposed next stop for an active attempt, recorded with its connectivity
  and whether it occupies the proposed position in any shortest route.
- **Evaluation**: A guess's connectivity and optimal-position marks and, after completion, the
  route's hop count, minimum hop count, and whether it is shortest.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In acceptance checks, 100% of offered sample challenges have distinct endpoints
  and a shortest route containing at least six stops including both endpoints.
- **SC-002**: In a representative set covering tied shortest routes, detours, connected and
  unconnected guesses, and unknown stops, 100% of guesses and completed routes are correctly
  classified, and all known guesses are available in the attempt history. The set MUST include tied
  shortest routes; connected and unconnected guesses both at and not at an optimal position; a guess
  after a detour; a repeated stop; a proposed position beyond every shortest route; an unknown stop;
  and shortest and longer completions. Checks MUST verify both marks for every known guess, rejection
  of the unknown stop, ordered history, and final route classification where applicable.
- **SC-003**: In acceptance checks, 100% of malformed inputs, unknown challenges, and unsolvable
  challenges receive an explicit failure outcome rather than a successful game result.
- **SC-004**: In 100% of integration acceptance checks, a client integrator can obtain a
  challenge, build a route one stop at a time, and obtain its result using the documented
  capabilities without requiring a frontend or external transit data.
- **SC-005**: Acceptance checks exercise challenge retrieval, attempt creation, attempt progress
  retrieval, and single-stop guessing. They verify explicit outcomes for malformed inputs,
  unavailable challenges, unavailable attempts, unknown stops, stale attempt revisions, and guesses
  against completed attempts.
- **SC-006**: For each rejected guess in the acceptance checks, the attempt's route, current stop,
  guess history, revision, status, and completion result remain unchanged. For a stale guess, the
  latest attempt progress is available so the client can retry.

## Assumptions

- The shortest path minimizes the number of connections, not travel time, distance, or transfers.
- Stop counts include the start and terminal; route lengths reported on completion count connections.
- The map is a future client concern; this phase supplies identifiable guesses and their marks but
  does not implement a map or visual interface.
- The player can start a new attempt rather than undo a guess; undo, additional hints, attempt limits,
  scoring, leaderboards, and daily challenges are outside this phase.
- Challenge selection defaults to the predefined sample challenge; creating or editing challenges
  is outside this phase.
- No authentication or player identity is needed for this sample phase. Any future
  authentication and all client integration must comply with the project constitution. Attempt
  access control is deferred; this phase does not promise private or owner-restricted attempts.
- Persistent data, production network data, and the visual interface are future work.
- All implementation and verification must comply with [constitution v1.4.0](../../.specify/memory/constitution.md). Its requirements
  for user-facing end-to-end tests apply when such a client flow exists; this phase has no frontend.
