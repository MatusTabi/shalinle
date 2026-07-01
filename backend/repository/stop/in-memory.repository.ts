import { initialTramNetwork } from "@/backend/data/tram-network/initial";
import type { Connection, Stop } from "@/backend/type/tram-network/type";
import type { StopRepository } from "./repository";

function normalizeStopName(name: string) {
    return name.trim().toLowerCase();
}

export class InMemoryStopRepository implements StopRepository {
    findAll(): Stop[] {
        return initialTramNetwork.stops;
    }

    findAllConnections(): Connection[] {
        return initialTramNetwork.connections;
    }

    findById(id: number): Stop | undefined {
        return initialTramNetwork.stops.find((stop) => stop.id === id);
    }

    findByName(name: string): Stop | undefined {
        const normalizedName = normalizeStopName(name);
        return initialTramNetwork.stops.find((stop) => normalizeStopName(stop.name) === normalizedName);
    }

    findConnection(stopId: number, neighborStopId: number): Connection | undefined {
        return initialTramNetwork.connections.find(
            (connection) =>
                (connection.fromStopId === stopId && connection.toStopId === neighborStopId) ||
                (connection.fromStopId === neighborStopId && connection.toStopId === stopId),
        );
    }

    findConnectionsForStop(stopId: number): Connection[] {
        return initialTramNetwork.connections.filter(
            (connection) => connection.fromStopId === stopId || connection.toStopId === stopId,
        );
    }

    getStartStopId(): number {
        return initialTramNetwork.startStopId;
    }

    getTerminalStopId(): number {
        return initialTramNetwork.terminalStopId;
    }
}
