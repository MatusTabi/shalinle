import type { StopDto } from "@/backend/dto/stop/dto";
import * as d3 from "d3";
import {
    GUESS_FORM_RESERVED_HEIGHT,
    INITIAL_VIEWPORT_PADDING,
    MAP_HEIGHT,
    MAP_WIDTH,
    NAVIGATION_RESERVED_HEIGHT,
} from "../constant";
import { getViewportX, getViewportY } from "./coordinate";

const SAFE_MIN_X = INITIAL_VIEWPORT_PADDING;
const SAFE_MAX_X = MAP_WIDTH - INITIAL_VIEWPORT_PADDING;
const SAFE_MIN_Y = NAVIGATION_RESERVED_HEIGHT + INITIAL_VIEWPORT_PADDING;
const SAFE_MAX_Y = MAP_HEIGHT - GUESS_FORM_RESERVED_HEIGHT - INITIAL_VIEWPORT_PADDING;

export function getFitTransform(stops: StopDto[]): d3.ZoomTransform {
    if (stops.length === 0) {
        return d3.zoomIdentity;
    }

    const xValues = stops.map((stop) => getViewportX(stop.x));
    const yValues = stops.map((stop) => getViewportY(stop.y));
    const minX = Math.min(...xValues) - INITIAL_VIEWPORT_PADDING;
    const maxX = Math.max(...xValues) + INITIAL_VIEWPORT_PADDING;
    const minY = Math.min(...yValues) - INITIAL_VIEWPORT_PADDING;
    const maxY = Math.max(...yValues) + INITIAL_VIEWPORT_PADDING;
    const boundsWidth = Math.max(1, maxX - minX);
    const boundsHeight = Math.max(1, maxY - minY);
    const availableHeight = MAP_HEIGHT - NAVIGATION_RESERVED_HEIGHT - GUESS_FORM_RESERVED_HEIGHT;
    const scale = Math.min(MAP_WIDTH / boundsWidth, availableHeight / boundsHeight);
    const translateX = (MAP_WIDTH - boundsWidth * scale) / 2 - minX * scale;
    const translateY = NAVIGATION_RESERVED_HEIGHT + (availableHeight - boundsHeight * scale) / 2 - minY * scale;

    return d3.zoomIdentity.translate(translateX, translateY).scale(scale);
}

export function isStopVisible(stop: StopDto, transform: d3.ZoomTransform) {
    const x = transform.applyX(getViewportX(stop.x));
    const y = transform.applyY(getViewportY(stop.y));

    return x >= SAFE_MIN_X && x <= SAFE_MAX_X && y >= SAFE_MIN_Y && y <= SAFE_MAX_Y;
}
