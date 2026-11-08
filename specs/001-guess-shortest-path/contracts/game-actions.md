# Contract: Game Server Actions

These are logical Next.js Server Action operations, not HTTP routes. Names below are proposed;
the concrete exported functions must use serializable inputs and outputs and validate every
untrusted argument with Zod. All identifiers are nonempty strings. Callers must treat actions as
publicly reachable; authentication and attempt authorization are explicitly deferred.
Perform validation and precondition guards before mutations; check operation-dependent conditions
before acting on their results. Expected business failures are Results, not thrown exceptions.
Technical failures are reported to Sentry at the action boundary without secrets, private state,
attempt identifiers, or guess histories. The action throws a sanitized exception rather than returning
a business-error Result; raw errors and stack traces are never exposed to callers. Clients MUST NOT
rely on the exception message, which may be replaced by the framework, or treat the failure as a
game-rule rejection. After an ambiguous guess failure, clients must retrieve progress before retrying.

## Shared response shapes

- `Result<T>`: `{ ok: true, data: T }` or `{ ok: false, error: Error }`.
- `Error`: `{ code, message, latestAttempt? }`; codes are `INVALID_INPUT`,
  `CHALLENGE_UNAVAILABLE`, `ATTEMPT_UNAVAILABLE`, `UNKNOWN_STOP`, `STALE_ATTEMPT`, and
  `ATTEMPT_COMPLETED`. Only `STALE_ATTEMPT` returns `latestAttempt`.
- `Stop`: `{ id, name }`.
- `Guess`: `{ stopId, position, connected, optimalPosition }`.
- `Attempt`: `{ id, challengeId, route: string[], currentStopId, guesses: Guess[], revision,
  status, result? }`. Status is `active` or `completed`. A result is present only when completed
  and is `{ routeHops, minimumHops, isShortest }`. All counts and revisions are integers.

Business-error messages MUST use fixed, non-sensitive descriptions and MUST NOT include submitted
identifiers or internal implementation details. For `STALE_ATTEMPT`, `latestAttempt` MUST contain the
full contract-defined `Attempt`, including its identifier and guess history. This snapshot does not
establish ownership or confidentiality.

## Operations

| Operation | Input | Success data | Additional errors |
|-----------|-------|--------------|-------------------|
| `getChallenge` | None | `{ id, startStopId, terminalStopId, stops: Stop[] }` | `CHALLENGE_UNAVAILABLE` |
| `startAttempt` | `{ challengeId }` | `Attempt` initialized at start, revision 0 | `CHALLENGE_UNAVAILABLE` |
| `getAttempt` | `{ attemptId }` | current `Attempt` | `ATTEMPT_UNAVAILABLE` |
| `guessStop` | `{ attemptId, stopId, expectedRevision }` | `{ attempt: Attempt, guess: Guess }` | `ATTEMPT_UNAVAILABLE`, `CHALLENGE_UNAVAILABLE`, `UNKNOWN_STOP`, `STALE_ATTEMPT`, `ATTEMPT_COMPLETED` |

Operations with inputs can return `INVALID_INPUT`. `expectedRevision` is a nonnegative integer. A
client requests the predefined challenge without supplying a challenge identifier. The response
includes its stable identifier, which the client supplies to `startAttempt`. The `stops` list includes
exactly one entry for each endpoint; `startStopId` and `terminalStopId` match those entries' IDs, and
their names provide the corresponding endpoint names.

An unknown, unreachable, identical-endpoint or too-short challenge is unavailable. If an existing
attempt's challenge is unavailable when `guessStop` is called, it returns `CHALLENGE_UNAVAILABLE`
without changing the attempt. If multiple error conditions apply to `guessStop`, precedence is input
validation, unavailable attempt, unavailable challenge, stale revision, completed attempt, and
unknown stop. Errors never change state. Stale errors carry the latest snapshot so the caller can
retry against its revision.

`guessStop` records every known stop and increments revision even when unconnected. It returns the
guess's marks and the updated snapshot; the snapshot's route advances only on a directed connection.
Before completion no response explicitly contains shortest paths, connection lists, or minimum hop
count; per-guess feedback intentionally allows inference. See [data model](../data-model.md).

Attempt identifiers do not establish ownership or confidentiality. If the attempt cannot be found,
including after a restart or instance change, return `ATTEMPT_UNAVAILABLE`; start a fresh attempt.
Guess transitions commit in full or leave the attempt entirely unchanged; an unexpected technical
failure before commit cannot leave partial state. If a client does not receive a definitive guess
response, it must retrieve the latest progress before deciding whether to retry. Replays are not
idempotent: any retry must use the revision from the retrieved progress.
