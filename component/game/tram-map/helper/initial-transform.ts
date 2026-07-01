import type { StopDto } from "@/backend/dto/stop/dto";
import * as d3 from "d3";
import { GUESS_FORM_RESERVED_HEIGHT, INITIAL_VIEWPORT_PADDING, MAP_HEIGHT, MAP_WIDTH } from "../constant";

export function getInitialTransform(stops: StopDto[]): d3.ZoomTransform {
    if (stops.length === 0) {
        return d3.zoomIdentity;
    }

    const xValues = stops.map((stop) => stop.x);
    const yValues = stops.map((stop) => stop.y);
    const minX = Math.min(...xValues) - INITIAL_VIEWPORT_PADDING;
    const maxX = Math.max(...xValues) + INITIAL_VIEWPORT_PADDING;
    const minY = Math.min(...yValues) - INITIAL_VIEWPORT_PADDING;
    const maxY = Math.max(...yValues) + INITIAL_VIEWPORT_PADDING;
    const boundsWidth = Math.max(1, maxX - minX);
    const boundsHeight = Math.max(1, maxY - minY);
    const availableHeight = MAP_HEIGHT - GUESS_FORM_RESERVED_HEIGHT;
    const scale = Math.min(MAP_WIDTH / boundsWidth, availableHeight / boundsHeight);
    const translateX = (MAP_WIDTH - boundsWidth * scale) / 2 - minX * scale;
    const translateY = (availableHeight - boundsHeight * scale) / 2 - minY * scale;

    return d3.zoomIdentity.translate(translateX, translateY).scale(scale);
}
