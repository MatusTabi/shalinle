"use server";

import type { GameStateDto } from "@/backend/dto/game/dto";
import type { GuessStopDto } from "@/backend/dto/guess/dto";
import { InMemoryGameRepository } from "@/backend/repository/game/in-memory.repository";
import { InMemoryStopRepository } from "@/backend/repository/stop/in-memory.repository";
import { GameService } from "@/backend/service/game/service";

const gameService = new GameService(new InMemoryGameRepository(), new InMemoryStopRepository());

export async function startGameAction(): Promise<GameStateDto> {
    return gameService.startGame();
}

export async function guessStopAction(input: GuessStopDto): Promise<GameStateDto> {
    return gameService.guessStop(input);
}
