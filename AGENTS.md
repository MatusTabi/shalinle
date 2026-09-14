# Shalinle

Shalinle is a route-discovery game built around a connected, geographically positioned network. A player receives two endpoints and reveals nodes by guessing their names until a correct connected route joins those endpoints.

## Architecture

- `app/` contains the Next.js application entry points. The home page renders the game.
- `component/game/` contains the client-side game screen, guess form, progress cards, completion dialog, and interactive map.
- `component/game/tram-map/` contains the current SVG/D3 map renderer. Its filenames retain the original tram-map terminology, but it is the generic network-map presentation layer.
- `backend/action/` exposes server actions used by the client.
- `backend/service/game/` owns game rules, graph traversal, visibility, route progress, and completion logic.
- `backend/repository/` abstracts storage. The current game and node repositories are in-memory, so games are lost when the server process restarts.
- `backend/data/tram-network/initial.ts` is the current initial network dataset. It is data, not an application-wide geographic or transport constraint.
- `backend/dto/` defines data crossing the server/client boundary. `backend/type/` holds domain types.

## Game Rules

- A new game chooses two connected endpoint nodes whose shortest graph distance is 5 through 13 edges, then reveals only those endpoints.
- A guessed known node is visible after the guess.
- A node adjacent to the revealed correct network is a correct neighbor and extends the correct route.
- A node connected only to already visible but incorrect nodes is gray-connected; a node with no visible neighbor is isolated.
- Repeated guesses and unknown names are recorded without changing the route.
- The game completes only when correct visible connections form a path between the endpoints.

## Map Behavior

- The map uses D3 for pan, zoom, and rendered SVG coordinates. Keep map geometry and view transforms in `component/game/tram-map/` rather than in React render state.
- The SVG viewBox is `790 x 520` and uses `preserveAspectRatio="xMidYMid slice"`.
- Automatic framing uses a `32px` inset from the map container's inner edge. It includes rendered markers and visible labels, preserves the network's geographic orientation, and centers spare space.
- Automatic framing recalculates when the map container resizes.
- Manual pan and zoom remain intact until a newly revealed node lies outside the safe viewport; then the map automatically refits.

## Conventions

- Use TypeScript strict mode and the `@/*` import alias.
- Follow existing React, Tailwind, and D3 patterns. Keep domain rules in services and keep repositories behind their interfaces.
- Treat DTOs as the boundary between server actions and client components.
- The codebase has no automated test runner. Add one only when the change needs repeatable coverage that lint, types, build, and manual verification cannot provide.

## Verification

Run these before completing a change:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

For changes to game rules, start a game and verify correct-neighbor, gray-connected, isolated, duplicate, and unknown guesses, then verify that joining the endpoints completes the game.

For changes to map rendering, start several games with differently spaced endpoints. Verify that automatically fitted rendered artwork, including labels, has a `32px` inset on its constraining axis; resize between desktop and mobile widths; manually pan or zoom; then reveal an off-screen node and confirm that the map refits.
