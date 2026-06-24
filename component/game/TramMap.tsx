"use client";

import type { GameStateDto } from "@/backend/dto/game/dto";
import type { StopDto } from "@/backend/dto/stop/dto";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type TramMapProps = {
    gameState: GameStateDto;
};

const mapWidth = 790;
const mapHeight = 520;

export function TramMap({ gameState }: TramMapProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<SVGGElement | null>(null);
    const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

    useEffect(() => {
        const svgElement = svgRef.current;

        if (!svgElement) {
            return;
        }

        const svg = d3.select(svgElement);
        svg.selectAll("*").remove();

        svg.attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`).attr("preserveAspectRatio", "xMidYMid slice");
        svg.append("title").text("Visible schematic tram map");

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

        svg.append("rect").attr("width", mapWidth).attr("height", mapHeight).attr("fill", "#0b1326");

        const content = svg.append("g").attr("class", "map-content");
        contentRef.current = content.node();

        const stopById = new Map(gameState.visibleStops.map((stop) => [stop.id, stop]));

        content
            .append("g")
            .attr("fill", "none")
            .selectAll("line.route")
            .data(gameState.visibleEdges)
            .join("line")
            .attr("class", "route")
            .attr("stroke", (edge) => edge.color)
            .attr("stroke-dasharray", (edge) => (edge.kind === "gray" ? "10 10" : null))
            .attr("stroke-width", 6);

        const stopGroups = content
            .append("g")
            .selectAll<SVGGElement, StopDto>("g.stop")
            .data(gameState.visibleStops, (stop) => stop.id)
            .join("g")
            .attr("class", "stop");

        stopGroups
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", "#ffffff")
            .attr("stroke", "#0b1326")
            .attr("stroke-width", 2);

        stopGroups
            .append("text")
            .attr("x", 8)
            .attr("y", -18)
            .attr("fill", "#dae2fd")
            .attr("font-size", 9)
            .attr("transform", "rotate(-45 18 -18)")
            .text((stop) => stop.name);

        function applyTransform(transform: d3.ZoomTransform) {
            content
                .selectAll<SVGLineElement, GameStateDto["visibleEdges"][number]>("line.route")
                .attr("x1", (edge) => transform.applyX(stopById.get(edge.fromStopId)?.x ?? 0))
                .attr("y1", (edge) => transform.applyY(stopById.get(edge.fromStopId)?.y ?? 0))
                .attr("x2", (edge) => transform.applyX(stopById.get(edge.toStopId)?.x ?? 0))
                .attr("y2", (edge) => transform.applyY(stopById.get(edge.toStopId)?.y ?? 0))
                .attr("stroke-width", 6)
                .attr("stroke-dasharray", (edge) => (edge.kind === "gray" ? "10 10" : null));

            content
                .selectAll<SVGGElement, StopDto>("g.stop")
                .attr("transform", (stop) => `translate(${transform.applyX(stop.x)}, ${transform.applyY(stop.y)})`);
        }

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.6, 5])
            .translateExtent([
                [-mapWidth * 1.5, -mapHeight * 1.5],
                [mapWidth * 2.5, mapHeight * 2.5],
            ])
            .on("zoom", (event) => {
                zoomTransformRef.current = event.transform;
                applyTransform(event.transform);
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
