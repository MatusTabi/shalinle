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
            const visibleConnections = [
                ...existingState.visibleConnections,
                ...this.toVisibleConnections(guessedStop.id, correctNeighborConnections, "correct"),
            ];

            return this.saveGuess(
                {
                    ...existingState,
                    visibleStopIds: [...existingState.visibleStopIds, guessedStop.id],
                    correctStopIds: [...existingState.correctStopIds, guessedStop.id],
                    visibleConnections: this.dedupeVisibleConnections(visibleConnections),
                },
                {
                    stopName: guessedStop.name,
                    status: "correct-neighbor",
                    message: "Correct. This stop is next to the revealed route.",
                },
            );
        }

        if (visibleNeighborConnections.length > 0) {
            const visibleConnections = [
                ...existingState.visibleConnections,
                ...this.toVisibleConnections(guessedStop.id, visibleNeighborConnections, "gray"),
            ];

            return this.saveGuess(
                {
                    ...existingState,
                    visibleStopIds: [...existingState.visibleStopIds, guessedStop.id],
                    visibleConnections: this.dedupeVisibleConnections(visibleConnections),
                },
                {
                    stopName: guessedStop.name,
                    status: "gray-connected",
                    message: "Visible, but connected only to isolated guessed stops.",
                },
            );
        }

        return this.saveGuess(
            {
                ...existingState,
                visibleStopIds: [...existingState.visibleStopIds, guessedStop.id],
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

    private toVisibleConnections(
        guessedStopId: string,
        connections: Connection[],
        kind: VisibleConnection["kind"],
    ): VisibleConnection[] {
        return connections.map((connection) => ({
            fromStopId: guessedStopId,
            toStopId: this.getOtherStopId(connection, guessedStopId),
            color: kind === "correct" ? connection.color : "#9ca3af",
            kind,
        }));
    }

    private getOtherStopId(connection: Connection, stopId: string): string {
        return connection.fromStopId === stopId ? connection.toStopId : connection.fromStopId;
    }

    private dedupeVisibleConnections(connections: VisibleConnection[]): VisibleConnection[] {
        const byKey = new Map<string, VisibleConnection>();

        for (const connection of connections) {
            const key = [connection.fromStopId, connection.toStopId].sort().join(":");
            const existingConnection = byKey.get(key);

            if (!existingConnection || connection.kind === "correct") {
                byKey.set(key, connection);
            }
        }

        return Array.from(byKey.values());
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

    private requireStop(stopId: string): Stop {
        const stop = this.stopRepository.findById(stopId);

        if (!stop) {
            throw new Error(`Stop ${stopId} not found.`);
        }

        return stop;
    }
}
