import type { GameStateDto } from "@/backend/dto/game/dto";
import type { StopDto } from "@/backend/dto/stop/dto";

export type TramMapProps = {
    gameState: GameStateDto;
};

export type VisibleEdge = GameStateDto["visibleEdges"][number];

export type RouteEdge = VisibleEdge & {
    laneIndex: number;
    laneCount: number;
};

export type StopShape = StopDto & {
    lineCount: number;
};

export type RouteCoordinates = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
