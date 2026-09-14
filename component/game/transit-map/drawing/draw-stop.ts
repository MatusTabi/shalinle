import type * as d3 from "d3";
import { getStopRectSize } from "../helper/stop-shape";
import type { StopShape } from "../type";

export function drawStops(content: d3.Selection<SVGGElement, unknown, null, undefined>, stopShapes: StopShape[]) {
    const stopGroups = content
        .append("g")
        .selectAll<SVGGElement, StopShape>("g.stop")
        .data(stopShapes)
        .join("g")
        .attr("class", "stop");

    stopGroups
        .append("rect")
        .attr("x", (stop) => -getStopRectSize(stop.lineCount).width / 2)
        .attr("y", (stop) => -getStopRectSize(stop.lineCount).height / 2)
        .attr("width", (stop) => getStopRectSize(stop.lineCount).width)
        .attr("height", (stop) => getStopRectSize(stop.lineCount).height)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", "#ffffff")
        .attr("stroke", "#0b1326")
        .attr("stroke-width", 2)
        .attr("display", (stop) => (stop.lineCount > 1 ? null : "none"));

    stopGroups
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#ffffff")
        .attr("stroke", "#0b1326")
        .attr("stroke-width", 2)
        .attr("display", (stop) => (stop.lineCount > 1 ? "none" : null));

    stopGroups
        .append("text")
        .attr("x", 8)
        .attr("y", -18)
        .attr("fill", "#dae2fd")
        .attr("font-size", 9)
        .attr("transform", "rotate(-45 18 -18)")
        .text((stop) => stop.name);
}
