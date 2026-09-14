import type { GameState } from "@/backend/type/transit-network/type";

export interface GameRepository {
    create(state: GameState): GameState;
    findById(id: string): GameState | undefined;
    save(state: GameState): GameState;
}
