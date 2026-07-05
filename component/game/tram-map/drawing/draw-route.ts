import type * as d3 from "d3";
import { ROUTE_STROKE_WIDTH } from "../constant";
import type { RouteEdge } from "../type";

export function drawRoutes(content: d3.Selection<SVGGElement, unknown, null, undefined>, routeEdges: RouteEdge[]) {
    content
        .append("g")
        .attr("fill", "none")
        .selectAll<SVGLineElement, RouteEdge>("line.route")
        .data(routeEdges)
        .join("line")
        .attr("class", "route")
        .attr("stroke", (edge) => edge.color)
        .attr("stroke-width", ROUTE_STROKE_WIDTH);
}
