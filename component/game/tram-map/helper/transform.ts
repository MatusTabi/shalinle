import type { StopDto } from "@/backend/dto/stop/dto";
import type * as d3 from "d3";
import { LABEL_HIDE_SCALE, LANE_GAP, MIN_LABEL_VISUAL_SCALE, ROUTE_STROKE_WIDTH } from "../constant";
import type { RouteCoordinates, RouteEdge, StopShape } from "../type";
import { getViewportX, getViewportY } from "./coordinate";
import { getVisualScale } from "./visual-scale";

type ApplyMapTransformInput = {
    content: d3.Selection<SVGGElement, unknown, null, undefined>;
    stopById: Map<string, StopDto>;
    transform: d3.ZoomTransform;
};

export function applyMapTransform({ content, stopById, transform }: ApplyMapTransformInput) {
    const visualScale = getVisualScale(transform.k);
    const labelVisualScale = Math.max(MIN_LABEL_VISUAL_SCALE, visualScale);
    const labelScaleRatio = labelVisualScale / visualScale;

    content
        .selectAll<SVGLineElement, RouteEdge>("line.route")
        .attr("x1", (edge) => getRouteCoordinates(edge, stopById, transform, visualScale).x1)
        .attr("y1", (edge) => getRouteCoordinates(edge, stopById, transform, visualScale).y1)
        .attr("x2", (edge) => getRouteCoordinates(edge, stopById, transform, visualScale).x2)
        .attr("y2", (edge) => getRouteCoordinates(edge, stopById, transform, visualScale).y2)
        .attr("stroke-width", ROUTE_STROKE_WIDTH * visualScale);

    content
        .selectAll<SVGGElement, StopShape>("g.stop")
        .attr(
            "transform",
            (stop) =>
                `translate(${transform.applyX(getViewportX(stop.x))}, ${transform.applyY(getViewportY(stop.y))}) scale(${visualScale})`,
        );

    content
        .selectAll<SVGTextElement, StopShape>("g.stop text")
        .attr("font-size", 9 * labelScaleRatio)
        .attr("display", transform.k < LABEL_HIDE_SCALE ? "none" : null);
}

function getRouteCoordinates(
    edge: RouteEdge,
    stopById: Map<string, StopDto>,
    transform: d3.ZoomTransform,
    visualScale: number,
): RouteCoordinates {
    const fromStop = stopById.get(edge.fromStopId);
    const toStop = stopById.get(edge.toStopId);

    if (!fromStop || !toStop) {
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }

    const x1 = transform.applyX(getViewportX(fromStop.x));
    const y1 = transform.applyY(getViewportY(fromStop.y));
    const x2 = transform.applyX(getViewportX(toStop.x));
    const y2 = transform.applyY(getViewportY(toStop.y));
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length === 0 || edge.laneCount === 1) {
        return { x1, y1, x2, y2 };
    }

    const offset = (edge.laneIndex - (edge.laneCount - 1) / 2) * LANE_GAP * visualScale;
    const offsetX = (-dy / length) * offset;
    const offsetY = (dx / length) * offset;

    return {
        x1: x1 + offsetX,
        y1: y1 + offsetY,
        x2: x2 + offsetX,
        y2: y2 + offsetY,
    };
}
