export class VLineImpl implements VLine {
    static yAxis(): VLineImpl;
    static from(point: Point | VLine): VLineImpl;
    static fromMaybe(arg: Point | VLine | undefined): VLineImpl | undefined;
    constructor(x: Length);
    x: Length;
    y: undefined;
    moveRight(offset: Length): this;
    moveLeft(offset: Length): this;
    distance(other: VLine): Length;
    clone(): VLineImpl;
    pointerRight(offset: Length): VLineImpl;
    pointerLeft(offset: Length): VLineImpl;
    isLeftOrEq(other: VLineImpl | Point): boolean;
    isRightOrEq(other: VLineImpl | Point): boolean;
}
export type Point = import("../Geometry.js").Point;
export type HLine = import("../CoordinateSystemSpecifics/Figures.js").HLine;
export type VLine = import("../CoordinateSystemSpecifics/Figures.js").VLine;
import { Length } from "../../Shared/Length.js";
