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

export type TransitNetwork = {
    stops: Stop[];
    connections: Connection[];
};

type GuessStatus = "correct-neighbor" | "isolated" | "gray-connected" | "duplicate" | "unknown";

type VisibleConnectionKind = "correct" | "gray";

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
    startStopId: string;
    terminalStopId: string;
    visibleStopIds: string[];
    correctStopIds: string[];
    visibleConnections: VisibleConnection[];
    guesses: GuessResult[];
};
