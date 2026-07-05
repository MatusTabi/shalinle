import { MAX_VISUAL_SCALE, MIN_VISUAL_SCALE } from "../constant";

export function getVisualScale(zoomScale: number) {
    return Math.max(MIN_VISUAL_SCALE, Math.min(MAX_VISUAL_SCALE, zoomScale));
}
