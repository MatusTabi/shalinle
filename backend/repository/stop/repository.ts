import type { Connection, Stop } from "@/backend/type/tram-network/type";

export interface StopRepository {
    findAll(): Stop[];
    findAllConnections(): Connection[];
    findById(id: string): Stop | undefined;
    findByName(name: string): Stop | undefined;
    findConnection(stopId: string, neighborStopId: string): Connection | undefined;
    findConnectionsForStop(stopId: string): Connection[];
}
