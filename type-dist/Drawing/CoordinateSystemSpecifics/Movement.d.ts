export class RelativeMovement implements Movement {
    static from(start: Point): {
        to(target: Point): RelativeMovement;
    };
    static right(amount: Length): RelativeMovement;
    static left(amount: Length): RelativeMovement;
    static up(amount: Length): RelativeMovement;
    static down(amount: Length): RelativeMovement;
    private constructor();
    x: Length;
    y: Length;
    change(point: Line | Point): void;
}
export class AlignMovement implements Movement {
    static alignHorizontalWith(line: VLine | Point): AlignMovement;
    static alignVerticalWith(line: HLine | Point): AlignMovement;
    private constructor();
    line: import("./Figures.d.ts").Line;
    change(point: Point): void;
}
export type Point = import("./Figures.d.ts").Point;
export type Line = import("./Figures.d.ts").Line;
export type HLine = import("./Figures.d.ts").HLine;
export type VLine = import("./Figures.d.ts").VLine;
export type Movement = import("../Geometry.d.ts").Movement;
import { Length } from "../../Shared/Length.js";
