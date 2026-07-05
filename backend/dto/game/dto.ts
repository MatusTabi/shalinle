import type { EdgeDto } from "@/backend/dto/edge/dto";
import type { GuessResultDto } from "@/backend/dto/guess/dto";
import type { StopDto } from "@/backend/dto/stop/dto";

export type GameStateDto = {
    id: string;
    startStop: StopDto;
    terminalStop: StopDto;
    visibleStops: StopDto[];
    visibleEdges: EdgeDto[];
    guesses: GuessResultDto[];
    availableStopNames: string[];
    routeProgress: {
        foundStops: number;
        totalStops: number;
    };
    isCompleted: boolean;
};
