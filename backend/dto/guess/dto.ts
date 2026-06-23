export type GuessStopDto = {
    gameId: string;
    stopName: string;
};

export type GuessResultDto = {
    stopName: string;
    status: "correct-neighbor" | "isolated" | "gray-connected" | "duplicate" | "unknown";
    message: string;
};
