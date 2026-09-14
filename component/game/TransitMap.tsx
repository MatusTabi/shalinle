"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { MAP_HEIGHT, MAP_WIDTH, VIEWPORT_PADDING_PX } from "./transit-map/constant";
import { drawBackground } from "./transit-map/drawing/draw-background";
import { drawDefinitions } from "./transit-map/drawing/draw-definition";
import { drawRoutes } from "./transit-map/drawing/draw-route";
import { drawStops } from "./transit-map/drawing/draw-stop";
import { getRouteEdges } from "./transit-map/helper/route-edge";
import { getStopShapes } from "./transit-map/helper/stop-shape";
import { applyMapTransform } from "./transit-map/helper/transform";
import { getFitTransform, isStopVisible } from "./transit-map/helper/viewport-transform";
import type { TransitMapProps } from "./transit-map/type";

export function TransitMap({ gameState }: TransitMapProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
    const didInitializeViewportRef = useRef(false);
    const previousVisibleStopIdsRef = useRef<Set<string>>(new Set());
    const hasManualViewportRef = useRef(false);

    useEffect(() => {
        const svgElement = svgRef.current;

        if (!svgElement) {
            return;
        }

        const svg = d3.select(svgElement);
        svg.selectAll("*").remove();

        svg.attr("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`).attr("preserveAspectRatio", "xMidYMid slice");

        drawDefinitions(svg);
        drawBackground(svg);

        const content = svg.append("g").attr("class", "map-content");
        const stopById = new Map(gameState.visibleStops.map((stop) => [stop.id, stop]));
        const routeEdges = getRouteEdges(gameState.visibleEdges);
        const stopShapes = getStopShapes(gameState.visibleStops, gameState.visibleEdges);

        drawRoutes(content, routeEdges);
        drawStops(content, stopShapes);

        const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
            if (event.sourceEvent) {
                hasManualViewportRef.current = true;
            }
            zoomTransformRef.current = event.transform;
            applyMapTransform({ content, stopById, transform: event.transform });
        });

        const getFittedTransform = () => {
            let transform = getFitTransform(gameState.visibleStops, svgElement);

            for (let iteration = 0; iteration < 4; iteration += 1) {
                applyMapTransform({ content, stopById, transform });
                const bounds = content.node()?.getBoundingClientRect();
                const svgBounds = svgElement.getBoundingClientRect();

                if (!bounds || bounds.width === 0 || bounds.height === 0) {
                    break;
                }

                const availableWidth = svgBounds.width - 2 * VIEWPORT_PADDING_PX;
                const availableHeight = svgBounds.height - 2 * VIEWPORT_PADDING_PX;
                const scale = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
                const point = svgElement.createSVGPoint();
                const inverseMatrix = svgElement.getScreenCTM()?.inverse();

                if (!Number.isFinite(scale) || !inverseMatrix) {
                    break;
                }

                point.x = svgBounds.left + svgBounds.width / 2;
                point.y = svgBounds.top + svgBounds.height / 2;
                const targetCenter = point.matrixTransform(inverseMatrix);
                point.x = bounds.left + bounds.width / 2;
                point.y = bounds.top + bounds.height / 2;
                const currentCenter = point.matrixTransform(inverseMatrix);
                const nextScale = transform.k * scale;
                const nextTransform = d3.zoomIdentity
                    .translate(
                        transform.x * scale + targetCenter.x - currentCenter.x * scale,
                        transform.y * scale + targetCenter.y - currentCenter.y * scale,
                    )
                    .scale(nextScale);

                if (Math.abs(nextTransform.k - transform.k) < 0.001) {
                    transform = nextTransform;
                    break;
                }

                transform = nextTransform;
            }

            return transform;
        };

        const previousVisibleStopIds = previousVisibleStopIdsRef.current;
        const newlyVisibleStops = gameState.visibleStops.filter((stop) => !previousVisibleStopIds.has(stop.id));
        const shouldFitViewport =
            !didInitializeViewportRef.current ||
            newlyVisibleStops.some((stop) => !isStopVisible(stop, zoomTransformRef.current, svgElement));
        const transform = shouldFitViewport ? getFittedTransform() : zoomTransformRef.current;

        zoomTransformRef.current = transform;
        if (shouldFitViewport) {
            hasManualViewportRef.current = false;
        }
        svg.call(zoom);
        if (shouldFitViewport && didInitializeViewportRef.current) {
            svg.transition().duration(450).ease(d3.easeCubicOut).call(zoom.transform, transform);
        } else {
            svg.call(zoom.transform, transform);
        }
        svg.on("dblclick.zoom", null);
        didInitializeViewportRef.current = true;
        previousVisibleStopIdsRef.current = new Set(gameState.visibleStops.map((stop) => stop.id));

        const resizeObserver = new ResizeObserver(() => {
            if (hasManualViewportRef.current) {
                return;
            }

            const resizedTransform = getFittedTransform();
            zoomTransformRef.current = resizedTransform;
            svg.call(zoom.transform, resizedTransform);
        });
        resizeObserver.observe(svgElement);

        return () => {
            resizeObserver.disconnect();
            svg.interrupt();
            svg.on(".zoom", null);
        };
    }, [gameState]);

    return (
        <svg
            ref={svgRef}
            className="block h-full w-full cursor-grab bg-background active:cursor-grabbing lg:touch-none"
            role="img"
        />
    );
}
