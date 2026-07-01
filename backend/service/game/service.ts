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
        const startStopId = this.stopRepository.getStartStopId();
        const terminalStopId = this.stopRepository.getTerminalStopId();
        const state = this.gameRepository.create({
            id: crypto.randomUUID(),
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

    private getOtherStopId(connection: Connection, stopId: number): number {
        return connection.fromStopId === stopId ? connection.toStopId : connection.fromStopId;
    }

    private getReachableCorrectStopIds(visibleStopIds: number[], seedCorrectStopIds: number[]): number[] {
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

    private getVisibleConnections(visibleStopIds: number[], correctStopIds: number[]): VisibleConnection[] {
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
        const startStop = this.requireStop(this.stopRepository.getStartStopId());
        const terminalStop = this.requireStop(this.stopRepository.getTerminalStopId());
        const visibleStops = state.visibleStopIds.map((stopId) => this.requireStop(stopId));

        return {
            id: state.id,
            startStop,
            terminalStop,
            visibleStops,
            visibleEdges: state.visibleConnections,
            guesses: state.guesses,
            availableStopNames: this.stopRepository.findAll().map((stop) => stop.name),
        };
    }

    private requireStop(stopId: number): Stop {
        const stop = this.stopRepository.findById(stopId);

        if (!stop) {
            throw new Error(`Stop ${stopId} not found.`);
        }

        return stop;
    }
}
