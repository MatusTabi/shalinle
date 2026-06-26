"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "./tram-map/constant";
import { drawBackground } from "./tram-map/drawing/draw-background";
import { drawDefinitions } from "./tram-map/drawing/draw-definition";
import { drawRoutes } from "./tram-map/drawing/draw-route";
import { drawStops } from "./tram-map/drawing/draw-stop";
import { getRouteEdges } from "./tram-map/helper/route-edge";
import { getStopShapes } from "./tram-map/helper/stop-shape";
import { applyMapTransform } from "./tram-map/helper/transform";
import type { TramMapProps } from "./tram-map/type";

export function TramMap({ gameState }: TramMapProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

    useEffect(() => {
        const svgElement = svgRef.current;

        if (!svgElement) {
            return;
        }

        const svg = d3.select(svgElement);
        svg.selectAll("*").remove();

        svg.attr("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`).attr("preserveAspectRatio", "xMidYMid slice");
        svg.append("title").text("Visible schematic tram map");

        drawDefinitions(svg);
        drawBackground(svg);

        const content = svg.append("g").attr("class", "map-content");
        const stopById = new Map(gameState.visibleStops.map((stop) => [stop.id, stop]));
        const routeEdges = getRouteEdges(gameState.visibleEdges);
        const stopShapes = getStopShapes(gameState.visibleStops, gameState.visibleEdges);

        drawRoutes(content, routeEdges);
        drawStops(content, stopShapes);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.6, 5])
            .translateExtent([
                [-MAP_WIDTH * 1.5, -MAP_HEIGHT * 1.5],
                [MAP_WIDTH * 2.5, MAP_HEIGHT * 2.5],
            ])
            .on("zoom", (event) => {
                zoomTransformRef.current = event.transform;
                applyMapTransform({ content, stopById, transform: event.transform });
            });

        svg.call(zoom);
        svg.call(zoom.transform, zoomTransformRef.current);
        svg.on("dblclick.zoom", null);

        return () => {
            svg.on(".zoom", null);
        };
    }, [gameState]);

    return (
        <svg
            ref={svgRef}
            className="block h-full w-full cursor-grab touch-none bg-background active:cursor-grabbing"
            role="img"
        />
    );
}
