import type { GameRepository } from "@/backend/repository/game/repository";
import type { GameState } from "@/backend/type/tram-network/type";

const gameStore = new Map<string, GameState>();

function cloneGameState(state: GameState): GameState {
    return {
        ...state,
        visibleStopIds: [...state.visibleStopIds],
        correctStopIds: [...state.correctStopIds],
        visibleConnections: state.visibleConnections.map((connection) => ({ ...connection })),
        guesses: state.guesses.map((guess) => ({ ...guess })),
    };
}

export class InMemoryGameRepository implements GameRepository {
    create(state: GameState): GameState {
        gameStore.set(state.id, cloneGameState(state));
        return cloneGameState(state);
    }

    findById(id: string): GameState | undefined {
        const state = gameStore.get(id);
        return state ? cloneGameState(state) : undefined;
    }

    save(state: GameState): GameState {
        gameStore.set(state.id, cloneGameState(state));
        return cloneGameState(state);
    }
}
