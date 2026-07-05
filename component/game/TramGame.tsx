"use client";

import { guessStopAction, startGameAction } from "@/backend/action/game/action";
import type { GameStateDto } from "@/backend/dto/game/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CompletionModal } from "./completion-modal/CompletionModal";
import { GuessForm } from "./GuessForm";
import { TramMap } from "./TramMap";

const gameQueryKey = ["game"] as const;

export function TramGame() {
    const queryClient = useQueryClient();
    const gameQuery = useQuery({
        queryKey: gameQueryKey,
        queryFn: startGameAction,
    });
    const guessMutation = useMutation({
        mutationFn: async (stopName: string) => {
            const gameState = queryClient.getQueryData<GameStateDto>(gameQueryKey);

            if (!gameState) {
                throw new Error("Game is not ready yet.");
            }

            return guessStopAction({ gameId: gameState.id, stopName });
        },
        onSuccess: (gameState) => {
            queryClient.setQueryData(gameQueryKey, gameState);
        },
    });

    const gameState = gameQuery.data;

    async function handlePlayAnother() {
        const newGameState = await startGameAction();
        queryClient.setQueryData(gameQueryKey, newGameState);
    }

    return (
        <main className="relative h-dvh w-dvw overflow-hidden bg-background text-on-background">
            {gameState ? <TramMap gameState={gameState} /> : null}
            {gameQuery.isLoading ? (
                <div className="absolute inset-0 grid place-items-center text-sm font-medium text-on-surface-variant">
                    Loading tram network...
                </div>
            ) : null}
            {gameQuery.error ? (
                <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-tertiary">
                    {gameQuery.error.message}
                </div>
            ) : null}
            {gameState ? (
                <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-5 sm:pb-8">
                    <div className="w-full max-w-xl">
                        <GuessForm
                            availableStopNames={gameState.availableStopNames.sort((a, b) => a.localeCompare(b))}
                            disabled={guessMutation.isPending || gameState.isCompleted}
                            onGuess={(stopName) => guessMutation.mutate(stopName)}
                        />
                    </div>
                </div>
            ) : null}
            <CompletionModal open={gameState?.isCompleted ?? false} onPlayAnother={handlePlayAnother} />
        </main>
    );
}
