import type { StopDto } from "@/backend/dto/stop/dto";
import { LANE_GAP, STOP_RECT_WIDTH } from "../constant";
import type { StopShape, VisibleEdge } from "../type";

export function getStopShapes(stops: StopDto[], edges: VisibleEdge[]): StopShape[] {
    const stopLineCountById = getUniqueStopLineCountById(edges);

    return stops.map((stop) => ({
        ...stop,
        lineCount: stopLineCountById.get(stop.id) ?? 0,
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
        const fromStopLineIds = lineIdsByStopId.get(edge.fromStopId) ?? new Set<string>();
        const toStopLineIds = lineIdsByStopId.get(edge.toStopId) ?? new Set<string>();

        fromStopLineIds.add(edge.lineId);
        toStopLineIds.add(edge.lineId);
        lineIdsByStopId.set(edge.fromStopId, fromStopLineIds);
        lineIdsByStopId.set(edge.toStopId, toStopLineIds);
    }

    return new Map(Array.from(lineIdsByStopId.entries()).map(([stopId, lineIds]) => [stopId, lineIds.size]));
}
