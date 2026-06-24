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
const routeStrokeWidth = 6;
const laneGap = 9;
const stopRectWidth = 18;

type VisibleEdge = GameStateDto["visibleEdges"][number];

type RouteEdge = VisibleEdge & {
    laneIndex: number;
    laneCount: number;
};

type StopShape = StopDto & {
    lineCount: number;
};

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

        const stopById = new Map(gameState.visibleStops.map((stop) => [stop.id, stop]));
        const routeEdges = getRouteEdges(gameState.visibleEdges);
        const stopLineCountById = getUniqueStopLineCountById(gameState.visibleEdges);
        const stopShapes: StopShape[] = gameState.visibleStops.map((stop) => ({
            ...stop,
            lineCount: stopLineCountById.get(stop.id) ?? 0,
        }));

        content
            .append("g")
            .attr("fill", "none")
            .selectAll<SVGLineElement, RouteEdge>("line.route")
            .data(routeEdges)
            .join("line")
            .attr("class", "route")
            .attr("stroke", (edge) => edge.color)
            .attr("stroke-dasharray", (edge) => (edge.kind === "gray" ? "10 10" : null))
            .attr("stroke-width", routeStrokeWidth);

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

        function applyTransform(transform: d3.ZoomTransform) {
            content
                .selectAll<SVGLineElement, RouteEdge>("line.route")
                .attr("x1", (edge) => getRouteCoordinates(edge, stopById, transform).x1)
                .attr("y1", (edge) => getRouteCoordinates(edge, stopById, transform).y1)
                .attr("x2", (edge) => getRouteCoordinates(edge, stopById, transform).x2)
                .attr("y2", (edge) => getRouteCoordinates(edge, stopById, transform).y2)
                .attr("stroke-width", routeStrokeWidth)
                .attr("stroke-dasharray", (edge) => (edge.kind === "gray" ? "10 10" : null));

            content
                .selectAll<SVGGElement, StopShape>("g.stop")
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

function getRouteEdges(edges: VisibleEdge[]): RouteEdge[] {
    const edgesByStopPair = new Map<string, VisibleEdge[]>();

    for (const edge of edges) {
        const key = getStopPairKey(edge.fromStopId, edge.toStopId);
        edgesByStopPair.set(key, [...(edgesByStopPair.get(key) ?? []), edge]);
    }

    return edges.map((edge) => {
        const sharedEdges = edgesByStopPair.get(getStopPairKey(edge.fromStopId, edge.toStopId)) ?? [edge];

        return {
            ...edge,
            laneIndex: sharedEdges.findIndex((sharedEdge) => sharedEdge.id === edge.id),
            laneCount: sharedEdges.length,
        };
    });
}

function getStopPairKey(firstStopId: string, secondStopId: string) {
    return [firstStopId, secondStopId].sort().join(":");
}

function getUniqueStopLineCountById(edges: VisibleEdge[]) {
    const lineIdsByStopId = new Map<string, Set<string>>();

    for (const edge of edges) {
        const fromStopLineIds = lineIdsByStopId.get(edge.fromStopId) ?? new Set<string>();
        const toStopLineIds = lineIdsByStopId.get(edge.toStopId) ?? new Set<string>();

        fromStopLineIds.add(edge.lineId);
        toStopLineIds.add(edge.lineId);
        lineIdsByStopId.set(edge.fromStopId, fromStopLineIds);
        lineIdsByStopId.set(edge.toStopId, toStopLineIds);
    }

    return new Map(Array.from(lineIdsByStopId.entries()).map(([stopId, lineIds]) => [stopId, lineIds.size]));
}

function getStopRectSize(lineCount: number) {
    const height = Math.max(14, lineCount * laneGap + 6);

    return {
        width: stopRectWidth,
        height,
    };
}

function getRouteCoordinates(edge: RouteEdge, stopById: Map<string, StopDto>, transform: d3.ZoomTransform) {
    const fromStop = stopById.get(edge.fromStopId);
    const toStop = stopById.get(edge.toStopId);

    if (!fromStop || !toStop) {
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }

    const x1 = transform.applyX(fromStop.x);
    const y1 = transform.applyY(fromStop.y);
    const x2 = transform.applyX(toStop.x);
    const y2 = transform.applyY(toStop.y);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length === 0 || edge.laneCount === 1) {
        return { x1, y1, x2, y2 };
    }

    const offset = (edge.laneIndex - (edge.laneCount - 1) / 2) * laneGap;
    const offsetX = (-dy / length) * offset;
    const offsetY = (dx / length) * offset;

    return {
        x1: x1 + offsetX,
        y1: y1 + offsetY,
        x2: x2 + offsetX,
        y2: y2 + offsetY,
    };
}
