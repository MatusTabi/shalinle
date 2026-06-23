import type { GameState } from "@/backend/type/tram-network/type";

export interface GameRepository {
    create(state: GameState): GameState;
    findById(id: string): GameState | undefined;
    save(state: GameState): GameState;
}
