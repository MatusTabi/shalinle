"use client";

import { guessStopAction, startGameAction } from "@/backend/action/game/action";
import type { GameStateDto } from "@/backend/dto/game/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
                    <div className="w-full max-w-xl rounded-3xl border border-outline-variant/70 bg-surface-container/75 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <GuessForm
                            availableStopNames={gameState.availableStopNames}
                            disabled={guessMutation.isPending}
                            onGuess={(stopName) => guessMutation.mutate(stopName)}
                        />
                    </div>
                </div>
            ) : null}
        </main>
    );
}
