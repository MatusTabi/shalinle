import type * as d3 from "d3";
import { MAP_HEIGHT, MAP_WIDTH } from "../constant";

export function drawBackground(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    svg.append("rect").attr("width", MAP_WIDTH).attr("height", MAP_HEIGHT).attr("fill", "var(--background)");
}
