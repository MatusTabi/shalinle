import type { RouteEdge, VisibleEdge } from "../type";

export function getRouteEdges(edges: VisibleEdge[]): RouteEdge[] {
    const edgesByStopPair = new Map<string, VisibleEdge[]>();

    for (const edge of edges) {
        const key = getStopPairKey(edge.fromStopId, edge.toStopId);
        edgesByStopPair.set(key, [...(edgesByStopPair.get(key) ?? []), edge]);
    }

    return edges.map((edge) => {
        const sharedEdges = edgesByStopPair.get(getStopPairKey(edge.fromStopId, edge.toStopId)) ?? [edge];

        return {
            ...edge,
            laneIndex: sharedEdges.findIndex((sharedEdge) => sharedEdge.id === edge.id),
            laneCount: sharedEdges.length,
        };
    });
}

function getStopPairKey(firstStopId: string, secondStopId: string): string {
    return [firstStopId, secondStopId].sort().join(":");
}
