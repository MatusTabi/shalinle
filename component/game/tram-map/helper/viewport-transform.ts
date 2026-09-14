import type { StopDto } from "@/backend/dto/stop/dto";
import * as d3 from "d3";
import { MAP_HEIGHT, MAP_WIDTH, VIEWPORT_PADDING_PX } from "../constant";
import { getViewportX, getViewportY } from "./coordinate";

type ViewportMetrics = {
    scale: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    padding: number;
};

export function getFitTransform(stops: StopDto[], svgElement: SVGSVGElement): d3.ZoomTransform {
    if (stops.length === 0) {
        return d3.zoomIdentity;
    }

    const viewport = getViewportMetrics(svgElement);
    const xValues = stops.map((stop) => getViewportX(stop.x));
    const yValues = stops.map((stop) => getViewportY(stop.y));
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const boundsWidth = Math.max(1, maxX - minX);
    const boundsHeight = Math.max(1, maxY - minY);
    const availableWidth = Math.max(1, viewport.maxX - viewport.minX - 2 * viewport.padding);
    const availableHeight = Math.max(1, viewport.maxY - viewport.minY - 2 * viewport.padding);
    const scale = Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight);
    const translateX = MAP_WIDTH / 2 - ((minX + maxX) / 2) * scale;
    const translateY = MAP_HEIGHT / 2 - ((minY + maxY) / 2) * scale;

    return d3.zoomIdentity.translate(translateX, translateY).scale(scale);
}

export function isStopVisible(stop: StopDto, transform: d3.ZoomTransform, svgElement: SVGSVGElement) {
    const viewport = getViewportMetrics(svgElement);
    const x = transform.applyX(getViewportX(stop.x));
    const y = transform.applyY(getViewportY(stop.y));

    return (
        x >= viewport.minX + viewport.padding &&
        x <= viewport.maxX - viewport.padding &&
        y >= viewport.minY + viewport.padding &&
        y <= viewport.maxY - viewport.padding
    );
}

function getViewportMetrics(svgElement: SVGSVGElement): ViewportMetrics {
    const { width, height } = svgElement.getBoundingClientRect();
    const scale = Math.max(width / MAP_WIDTH, height / MAP_HEIGHT) || 1;
    const visibleWidth = width / scale;
    const visibleHeight = height / scale;

    return {
        scale,
        minX: (MAP_WIDTH - visibleWidth) / 2,
        maxX: (MAP_WIDTH + visibleWidth) / 2,
        minY: (MAP_HEIGHT - visibleHeight) / 2,
        maxY: (MAP_HEIGHT + visibleHeight) / 2,
        padding: VIEWPORT_PADDING_PX / scale,
    };
}
