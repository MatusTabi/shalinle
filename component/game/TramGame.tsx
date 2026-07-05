"use client";

import { guessStopAction, startGameAction } from "@/backend/action/game/action";
import type { GameStateDto } from "@/backend/dto/game/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RecentGuessList } from "./cards/RecentGuessList";
import RouteCard from "./cards/RouteCard";
import { CompletionModal } from "./completion-modal/CompletionModal";
import { GuessForm } from "./GuessForm";
import { TramMap } from "./TramMap";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

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
                <div className="absolute inset-x-0 bottom-0 top-[72px] z-10 grid min-h-0 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(0,4fr)_minmax(220px,1fr)]">
                    <aside className="min-w-0 lg:pt-0">
                        <RouteCard
                            startStop={gameState.startStop.name}
                            terminalStop={gameState.terminalStop.name}
                            totalGuesses={gameState.guesses.length}
                            routeProgress={`${gameState.routeProgress.foundStops} / ${gameState.routeProgress.totalStops}`}
                            isCompleted={gameState.isCompleted}
                        />
                    </aside>
                    <section className="relative min-h-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                        <TramMap gameState={gameState} />
                        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 sm:bottom-6">
                            <div className="w-full max-w-xl">
                                <GuessForm
                                    availableStopNames={gameState.availableStopNames.sort((a, b) => a.localeCompare(b))}
                                    disabled={guessMutation.isPending || gameState.isCompleted}
                                    onGuess={(stopName) => guessMutation.mutate(stopName)}
                                />
                            </div>
                        </div>
                    </section>
                    <aside className="hidden min-w-0 lg:flex lg:flex-col lg:gap-2" aria-label="Guess history">
                        <RecentGuessList guesses={gameState.guesses} />
                        <Button
                            className={cn("w-full uppercase", gameState.isCompleted ? "block" : "hidden")}
                            onClick={() => void handlePlayAnother()}
                        >
                            Start New Game
                        </Button>
                    </aside>
                </div>
            ) : null}
            <CompletionModal open={gameState?.isCompleted ?? false} onPlayAnother={handlePlayAnother} />
        </main>
    );
}
