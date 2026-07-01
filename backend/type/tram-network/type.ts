export type Stop = {
    id: string;
    name: string;
    x: number;
    y: number;
};

export type Connection = {
    id: string;
    lineId: string;
    fromStopId: string;
    toStopId: string;
    color: string;
};

export type TramNetwork = {
    startStopId: string;
    terminalStopId: string;
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
