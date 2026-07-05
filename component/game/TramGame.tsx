"use client";

import { guessStopAction, startGameAction } from "@/backend/action/game/action";
import type { GameStateDto } from "@/backend/dto/game/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { OptimalPathCard } from "./cards/OptimalPathCard";
import { RecentGuessList } from "./cards/RecentGuessList";
import RouteCard from "./cards/RouteCard";
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
        <main className="relative min-h-dvh w-full overflow-y-auto bg-background text-on-background lg:h-dvh lg:w-dvw lg:overflow-hidden">
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
                <div className="relative z-10 flex min-h-dvh flex-col gap-3 px-3 pb-4 pt-[84px] lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-[72px] lg:grid lg:min-h-0 lg:grid-cols-[minmax(220px,1fr)_minmax(0,4fr)_minmax(220px,1fr)] lg:gap-4 lg:p-4 lg:pt-4">
                    <aside className="min-w-0 lg:pt-0">
                        <RouteCard
                            startStop={gameState.startStop.name}
                            terminalStop={gameState.terminalStop.name}
                            totalGuesses={gameState.guesses.length}
                            routeProgress={`${gameState.routeProgress.foundStops} / ${gameState.routeProgress.totalStops}`}
                            isCompleted={gameState.isCompleted}
                        />
                    </aside>
                    <section className="relative h-[68dvh] min-h-[28rem] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest lg:h-auto lg:min-h-0">
                        <TramMap gameState={gameState} />
                        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 sm:bottom-6 sm:px-4">
                            <div className="w-full max-w-xl">
                                <GuessForm
                                    availableStopNames={gameState.availableStopNames.sort((a, b) => a.localeCompare(b))}
                                    disabled={guessMutation.isPending || gameState.isCompleted}
                                    onGuess={(stopName) => guessMutation.mutate(stopName)}
                                />
                            </div>
                        </div>
                    </section>
                    <aside className="flex min-w-0 flex-col gap-2 lg:flex" aria-label="Guess history">
                        <RecentGuessList guesses={gameState.guesses} />
                        {gameState.isCompleted ? <OptimalPathCard stops={gameState.optimalPathStops} /> : null}
                        {gameState.isCompleted ? (
                            <Button className="w-full uppercase" onClick={() => void handlePlayAnother()}>
                                Start New Game
                            </Button>
                        ) : null}
                    </aside>
                </div>
            ) : null}
            <CompletionModal open={gameState?.isCompleted ?? false} onPlayAnother={handlePlayAnother} />
        </main>
    );
}
