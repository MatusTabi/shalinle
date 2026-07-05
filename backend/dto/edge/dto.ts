export type EdgeDto = {
    id: string;
    lineId: string;
    fromStopId: string;
    toStopId: string;
    color: string;
    kind: "correct" | "gray";
};
