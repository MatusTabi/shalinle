import type { GameStateDto } from "@/backend/dto/game/dto";
import type { GuessStopDto } from "@/backend/dto/guess/dto";
import type { GameRepository } from "@/backend/repository/game/repository";
import type { StopRepository } from "@/backend/repository/stop/repository";
import type { Connection, GameState, GuessResult, Stop, VisibleConnection } from "@/backend/type/tram-network/type";

export class GameService {
    constructor(
        private readonly gameRepository: GameRepository,
        private readonly stopRepository: StopRepository,
    ) {}

    startGame(): GameStateDto {
        const { startStopId, terminalStopId } = this.getRandomEndpointPair();
        const state = this.gameRepository.create({
            id: crypto.randomUUID(),
            startStopId,
            terminalStopId,
            visibleStopIds: [startStopId, terminalStopId],
            correctStopIds: [startStopId, terminalStopId],
            visibleConnections: [],
            guesses: [],
        });

        return this.toDto(state);
    }

    guessStop(input: GuessStopDto): GameStateDto {
        const existingState = this.gameRepository.findById(input.gameId);

        if (!existingState) {
            return this.startGame();
        }

        if (this.isCompleted(existingState)) {
            return this.toDto(existingState);
        }

        const guessedStop = this.stopRepository.findByName(input.stopName);

        if (!guessedStop) {
            return this.saveGuess(existingState, {
                stopName: input.stopName,
                status: "unknown",
                message: "No stop with that name exists on this tram map.",
            });
        }

        if (existingState.visibleStopIds.includes(guessedStop.id)) {
            return this.saveGuess(existingState, {
                stopName: guessedStop.name,
                status: "duplicate",
                message: "That stop is already visible.",
            });
        }

        const connections = this.stopRepository.findConnectionsForStop(guessedStop.id);
        const visibleNeighborConnections = connections.filter((connection) =>
            existingState.visibleStopIds.includes(this.getOtherStopId(connection, guessedStop.id)),
        );
        const correctNeighborConnections = visibleNeighborConnections.filter((connection) =>
            existingState.correctStopIds.includes(this.getOtherStopId(connection, guessedStop.id)),
        );

        if (correctNeighborConnections.length > 0) {
            const visibleStopIds = [...existingState.visibleStopIds, guessedStop.id];
            const correctStopIds = this.getReachableCorrectStopIds(visibleStopIds, [
                ...existingState.correctStopIds,
                guessedStop.id,
            ]);

            return this.saveGuess(
                {
                    ...existingState,
                    visibleStopIds,
                    correctStopIds,
                    visibleConnections: this.getVisibleConnections(visibleStopIds, correctStopIds),
                },
                {
                    stopName: guessedStop.name,
                    status: "correct-neighbor",
                    message: "Correct. This stop is next to the revealed route.",
                },
            );
        }

        if (visibleNeighborConnections.length > 0) {
            const visibleStopIds = [...existingState.visibleStopIds, guessedStop.id];

            return this.saveGuess(
                {
                    ...existingState,
                    visibleStopIds,
                    visibleConnections: this.getVisibleConnections(visibleStopIds, existingState.correctStopIds),
                },
                {
                    stopName: guessedStop.name,
                    status: "gray-connected",
                    message: "Visible, but connected only to isolated guessed stops.",
                },
            );
        }

        const visibleStopIds = [...existingState.visibleStopIds, guessedStop.id];

        return this.saveGuess(
            {
                ...existingState,
                visibleStopIds,
                visibleConnections: this.getVisibleConnections(visibleStopIds, existingState.correctStopIds),
            },
            {
                stopName: guessedStop.name,
                status: "isolated",
                message: "Visible, but not next to the currently correct route.",
            },
        );
    }

    private saveGuess(state: GameState, guess: GuessResult): GameStateDto {
        const savedState = this.gameRepository.save({ ...state, guesses: [guess, ...state.guesses] });
        return this.toDto(savedState);
    }

    private getRandomEndpointPair(): { startStopId: string; terminalStopId: string } {
        const shuffledStops = this.shuffle(this.stopRepository.findAll());

        for (const stop of shuffledStops) {
            const terminalStopIds = this.getStopIdsByDistanceRange(stop.id, 5, 13);

            if (terminalStopIds.length > 0) {
                return {
                    startStopId: stop.id,
                    terminalStopId: terminalStopIds[Math.floor(Math.random() * terminalStopIds.length)],
                };
            }
        }

        return this.getFallbackEndpointPair();
    }

    private getFallbackEndpointPair(): { startStopId: string; terminalStopId: string } {
        const stops = this.stopRepository.findAll();

        if (stops.length < 2) {
            throw new Error("At least two stops are required to start a game.");
        }

        const startStop = stops[0];
        const terminalStop = stops.at(-1);

        return {
            startStopId: startStop.id,
            terminalStopId: terminalStop?.id ?? stops[1].id,
        };
    }

    private getStopIdsByDistanceRange(startStopId: string, minDistance: number, maxDistance: number): string[] {
        const distanceByStopId = new Map<string, number>([[startStopId, 0]]);
        const queue = [startStopId];

        while (queue.length > 0) {
            const stopId = queue.shift();

            if (!stopId) {
                continue;
            }

            const distance = distanceByStopId.get(stopId) ?? 0;

            if (distance >= maxDistance) {
                continue;
            }

            for (const connection of this.stopRepository.findConnectionsForStop(stopId)) {
                const neighborStopId = this.getOtherStopId(connection, stopId);

                if (distanceByStopId.has(neighborStopId)) {
                    continue;
                }

                distanceByStopId.set(neighborStopId, distance + 1);
                queue.push(neighborStopId);
            }
        }

        return Array.from(distanceByStopId.entries())
            .filter(([, distance]) => distance >= minDistance && distance <= maxDistance)
            .map(([stopId]) => stopId);
    }

    private shuffle<T>(items: T[]): T[] {
        const shuffledItems = [...items];

        for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
        }

        return shuffledItems;
    }

    private getOtherStopId(connection: Connection, stopId: string): string {
        return connection.fromStopId === stopId ? connection.toStopId : connection.fromStopId;
    }

    private getReachableCorrectStopIds(visibleStopIds: string[], seedCorrectStopIds: string[]): string[] {
        const visibleStopIdSet = new Set(visibleStopIds);
        const reachableStopIdSet = new Set(seedCorrectStopIds.filter((stopId) => visibleStopIdSet.has(stopId)));
        const queue = Array.from(reachableStopIdSet);

        while (queue.length > 0) {
            const stopId = queue.shift();

            if (!stopId) {
                continue;
            }

            for (const connection of this.stopRepository.findConnectionsForStop(stopId)) {
                const neighborStopId = this.getOtherStopId(connection, stopId);

                if (!visibleStopIdSet.has(neighborStopId) || reachableStopIdSet.has(neighborStopId)) {
                    continue;
                }

                reachableStopIdSet.add(neighborStopId);
                queue.push(neighborStopId);
            }
        }

        return Array.from(reachableStopIdSet);
    }

    private getVisibleConnections(visibleStopIds: string[], correctStopIds: string[]): VisibleConnection[] {
        const visibleStopIdSet = new Set(visibleStopIds);
        const correctStopIdSet = new Set(correctStopIds);

        return this.stopRepository
            .findAllConnections()
            .filter(
                (connection) =>
                    visibleStopIdSet.has(connection.fromStopId) && visibleStopIdSet.has(connection.toStopId),
            )
            .map((connection) => {
                const kind: VisibleConnection["kind"] =
                    correctStopIdSet.has(connection.fromStopId) && correctStopIdSet.has(connection.toStopId)
                        ? "correct"
                        : "gray";

                return {
                    id: connection.id,
                    lineId: connection.lineId,
                    fromStopId: connection.fromStopId,
                    toStopId: connection.toStopId,
                    color: kind === "correct" ? connection.color : "#808080",
                    kind,
                };
            });
    }

    private toDto(state: GameState): GameStateDto {
        const startStop = this.requireStop(state.startStopId);
        const terminalStop = this.requireStop(state.terminalStopId);
        const visibleStops = state.visibleStopIds.map((stopId) => this.requireStop(stopId));

        return {
            id: state.id,
            startStop,
            terminalStop,
            visibleStops,
            visibleEdges: state.visibleConnections,
            guesses: state.guesses,
            availableStopNames: this.stopRepository.findAll().map((stop) => stop.name),
            isCompleted: this.isCompleted(state),
        };
    }

    private isCompleted(state: GameState): boolean {
        const startStopId = state.startStopId;
        const terminalStopId = state.terminalStopId;
        const connectedStopIdsByStopId = new Map<string, Set<string>>();

        for (const connection of state.visibleConnections) {
            if (connection.kind !== "correct") {
                continue;
            }

            const fromStopConnectionIds = connectedStopIdsByStopId.get(connection.fromStopId) ?? new Set<string>();
            const toStopConnectionIds = connectedStopIdsByStopId.get(connection.toStopId) ?? new Set<string>();

            fromStopConnectionIds.add(connection.toStopId);
            toStopConnectionIds.add(connection.fromStopId);
            connectedStopIdsByStopId.set(connection.fromStopId, fromStopConnectionIds);
            connectedStopIdsByStopId.set(connection.toStopId, toStopConnectionIds);
        }

        const visitedStopIds = new Set<string>();
        const queue = [startStopId];

        while (queue.length > 0) {
            const stopId = queue.shift();

            if (!stopId || visitedStopIds.has(stopId)) {
                continue;
            }

            if (stopId === terminalStopId) {
                return true;
            }

            visitedStopIds.add(stopId);

            for (const connectedStopId of connectedStopIdsByStopId.get(stopId) ?? []) {
                queue.push(connectedStopId);
            }
        }

        return false;
    }

    private requireStop(stopId: string): Stop {
        const stop = this.stopRepository.findById(stopId);

        if (!stop) {
            throw new Error(`Stop ${stopId} not found.`);
        }

        return stop;
    }
}
