export type Stop = {
    id: number;
    name: string;
    x: number;
    y: number;
};

export type Connection = {
    id: number;
    lineId: number;
    fromStopId: number;
    toStopId: number;
    color: string;
};

export type TramNetwork = {
    startStopId: number;
    terminalStopId: number;
    stops: Stop[];
    connections: Connection[];
};

export type GuessStatus = "correct-neighbor" | "isolated" | "gray-connected" | "duplicate" | "unknown";

export type VisibleConnectionKind = "correct" | "gray";

export type VisibleConnection = {
    id: string;
    lineId: string;
    fromStopId: string;
    toStopId: string;
    color: string;
    kind: VisibleConnectionKind;
};

export type GuessResult = {
    stopName: string;
    status: GuessStatus;
    message: string;
};

export type GameState = {
    id: string;
    visibleStopIds: string[];
    correctStopIds: string[];
    visibleConnections: VisibleConnection[];
    guesses: GuessResult[];
};
