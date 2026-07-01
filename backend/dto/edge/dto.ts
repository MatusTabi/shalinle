export type EdgeDto = {
    id: number;
    lineId: number;
    fromStopId: number;
    toStopId: number;
    color: string;
    kind: "correct" | "gray";
};
