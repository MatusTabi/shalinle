# Data Model: Guess the Shortest Path

## Sample network

- **Stop**: stable nonempty identifier and display name, unique within the network.
- **Directed connection**: ordered pair of existing stop identifiers. A reverse connection is
  independent. Each connection has cost one. The graph is private to the server.
- **Challenge**: stable identifier, start and terminal stop identifiers, and network. Endpoints
  are distinct and known. The terminal must be reachable in at least five hops; otherwise the
  challenge is unavailable. The public projection contains stops but no connections or answer.
- **Shortest-path analysis**: minimum hop count `D`, distances from the start and distances to
  the terminal computed on the reversed graph. For proposed one-based position `p`, stop `v` is
  optimal exactly when `distanceFromStart(v) = p - 1` and
  `distanceFromStart(v) + distanceToTerminal(v) = D`. Missing distances never match. Compute for
  every tied shortest route without relying on the player's route.

## Attempt and guesses

- **Attempt**: opaque unique identifier, challenge identifier, accepted stop route, current stop,
  ordered guess history, nonnegative revision, and active/completed status. Starts active at
  revision 0 with route `[start]`, no guesses and current stop equal to start. Different attempts
  have independent mutable state. Identity does not imply confidentiality or ownership.
- **Guess record**: stop identifier, proposed one-based position, connected boolean, and
  optimal-position boolean. All known guesses, including repeats and unconnected guesses, are
  recorded in order. Unknown stops and malformed inputs do not mutate the attempt.
- **Completion result**: accepted route hop count, minimum hop count, and shortest boolean.
  Exists only after a connected guess reaches the terminal. Unconnected guesses do not count as
  route hops and cannot complete an attempt, including an unconnected terminal guess.

## Transitions and consistency

1. Start: validate challenge and create a separate attempt.
2. Guess: validate identifiers and expected revision. For an active attempt, determine both marks
   from the pre-guess state; append a record and increment revision for every known guess. If
   connected, append the stop and update current stop. If terminal is reached, complete and attach
   the result; otherwise remain active. An unconnected guess leaves the route and current stop as-is.
3. A stale revision, unknown stop, malformed input, unavailable attempt or completed attempt
   changes no state. A stale result includes the latest public attempt snapshot.
4. Compare revision and apply the full transition atomically within one process: no asynchronous
   gap between comparison and update. This does not provide cross-instance consistency.
   Guards return explicit business failure Results before any mutation; unexpected technical
   failures are exceptions handled at an appropriate boundary without exposing sensitive details.

The repository holds attempts in process memory only; restart, eviction or a different instance
may make an attempt unavailable. There is no defined expiry duration or persistence guarantee.
