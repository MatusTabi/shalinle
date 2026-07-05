import { MAP_CENTER_X, MAP_CENTER_Y } from "../constant";

export function getViewportX(x: number) {
    return MAP_CENTER_X + x;
}

export function getViewportY(y: number) {
    return MAP_CENTER_Y + y;
}
