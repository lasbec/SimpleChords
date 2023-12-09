export class HLineImpl implements HLine {
    static xAxis(): HLineImpl;
    static from(point: Point | HLine): HLineImpl;
    static fromMaybe(arg: Point | HLine | undefined): HLineImpl | undefined;
    constructor(y: Length);
    y: Length;
    x: undefined;
    moveUp(offset: Length): this;
    moveDown(offset: Length): this;
    clone(): HLineImpl;
    distance(other: HLine): Length;
    pointerUp(offset: Length): HLineImpl;
    pointerDown(offset: Length): HLineImpl;
    isLowerOrEq(other: HLineImpl | Point): boolean;
    isHigherOrEq(other: HLineImpl | Point): boolean;
}
export type Point = import("../Geometry.js").Point;
export type HLine = import("../CoordinateSystemSpecifics/Figures.js").HLine;
export type VLine = import("../CoordinateSystemSpecifics/Figures.js").VLine;
import { Length } from "../../Shared/Length.js";
