export class PointCompare {
    static isLeftOrEq(p0: VLine | Point, p1: VLine | Point): boolean;
    static isLowerOrEq(p0: HLine | Point, p1: HLine | Point): boolean;
    static isRightOrEq(p0: VLine | Point, p1: VLine | Point): boolean;
    static isHigherOrEq(p0: HLine | Point, p1: HLine | Point): boolean;
}
export type Point = import("./Figures.d.ts").Point;
export type VLine = import("./Figures.d.ts").VLine;
export type HLine = import("./Figures.d.ts").HLine;
