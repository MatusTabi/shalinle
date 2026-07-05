import type { StopDto } from "@/backend/dto/stop/dto";
import { LANE_GAP, STOP_RECT_WIDTH } from "../constant";
import type { StopShape, VisibleEdge } from "../type";

export function getStopShapes(stops: StopDto[], edges: VisibleEdge[]): StopShape[] {
    const stopLineCountById = getUniqueStopLineCountById(edges);

    return stops.map((stop) => ({
        ...stop,
        lineCount: stopLineCountById.get(String(stop.id)) ?? 0,
    }));
}

export function getStopRectSize(lineCount: number) {
    const height = Math.max(14, lineCount * LANE_GAP + 6);

    return {
        width: STOP_RECT_WIDTH,
        height,
    };
}

function getUniqueStopLineCountById(edges: VisibleEdge[]) {
    const lineIdsByStopId = new Map<string, Set<string>>();

    for (const edge of edges) {
        const fromStopLineIds = lineIdsByStopId.get(String(edge.fromStopId) ?? 0) ?? new Set<string>();
        const toStopLineIds = lineIdsByStopId.get(String(edge.toStopId) ?? 0) ?? new Set<string>();

        fromStopLineIds.add(String(edge.lineId) ?? 0);
        toStopLineIds.add(String(edge.lineId) ?? 0);
        lineIdsByStopId.set(String(edge.fromStopId) ?? 0, fromStopLineIds);
        lineIdsByStopId.set(String(edge.toStopId) ?? 0, toStopLineIds);
    }

    return new Map(Array.from(lineIdsByStopId.entries()).map(([stopId, lineIds]) => [stopId, lineIds.size]));
}
