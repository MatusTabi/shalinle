import { initialTransitNetwork } from "@/backend/data/transit-network/initial";
import type { Connection, Stop } from "@/backend/type/transit-network/type";
import type { StopRepository } from "./repository";

function normalizeStopName(name: string) {
    return name.trim().toLowerCase();
}

export class InMemoryStopRepository implements StopRepository {
    findAll(): Stop[] {
        return initialTransitNetwork.stops;
    }

    findAllConnections(): Connection[] {
        return initialTransitNetwork.connections;
    }

    findById(id: string): Stop | undefined {
        return initialTransitNetwork.stops.find((stop) => stop.id === id);
    }

    findByName(name: string): Stop | undefined {
        const normalizedName = normalizeStopName(name);
        return initialTransitNetwork.stops.find((stop) => normalizeStopName(stop.name) === normalizedName);
    }

    findConnection(stopId: string, neighborStopId: string): Connection | undefined {
        return initialTransitNetwork.connections.find(
            (connection) =>
                (connection.fromStopId === stopId && connection.toStopId === neighborStopId) ||
                (connection.fromStopId === neighborStopId && connection.toStopId === stopId),
        );
    }

    findConnectionsForStop(stopId: string): Connection[] {
        return initialTransitNetwork.connections.filter(
            (connection) => connection.fromStopId === stopId || connection.toStopId === stopId,
        );
    }
}
