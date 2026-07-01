import type { Connection, Stop } from "@/backend/type/tram-network/type";

export interface StopRepository {
    findAll(): Stop[];
    findAllConnections(): Connection[];
    findById(id: number): Stop | undefined;
    findByName(name: string): Stop | undefined;
    findConnection(stopId: number, neighborStopId: number): Connection | undefined;
    findConnectionsForStop(stopId: number): Connection[];
    getStartStopId(): number;
    getTerminalStopId(): number;
}
