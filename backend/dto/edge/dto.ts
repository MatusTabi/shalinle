export type EdgeDto = {
    fromStopId: string;
    toStopId: string;
    color: string;
    kind: "correct" | "gray";
};
