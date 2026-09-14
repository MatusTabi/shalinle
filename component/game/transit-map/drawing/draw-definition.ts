import type * as d3 from "d3";

export function drawDefinitions(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    const defs = svg.append("defs");

    defs.append("filter")
        .attr("id", "node-shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("stdDeviation", 8)
        .attr("flood-color", "#8ed5ff")
        .attr("flood-opacity", 0.32);
}
