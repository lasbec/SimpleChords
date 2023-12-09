export class PointImpl implements Point {
    static origin(): PointImpl;
    static fromPoint(point: Point): PointImpl;
    constructor(x: Length, y: Length);
    x: Length;
    y: Length;
    rawPointIn(unit: import("../../Shared/Length.js").UnitName): {
        x: number;
        y: number;
    };
    alignVerticalWith(other: Point | HLine): this;
    alignHorizontalWith(other: Point | VLine): this;
    moveRight(offset: Length): this;
    moveLeft(offset: Length): this;
    moveUp(offset: Length): this;
    moveDown(offset: Length): this;
    move(dir: "left" | "right" | "up" | "down", offset: Length): this;
    clone(): PointImpl;
    pointerRight(offset: Length): PointImpl;
    pointerLeft(offset: Length): PointImpl;
    pointerUp(offset: Length): PointImpl;
    pointerDown(offset: Length): PointImpl;
    span(other: PointImpl): RectangleImpl;
    isLeftOrEq(other: Point | VLine): boolean;
    isLowerOrEq(other: Point | HLine): boolean;
    isRightOrEq(other: Point | VLine): boolean;
    isHigherOrEq(other: Point | HLine): boolean;
}
export type Point = import("../Geometry.js").Point;
export type VLine = import("../CoordinateSystemSpecifics/Figures.js").VLine;
export type HLine = import("../CoordinateSystemSpecifics/Figures.js").HLine;
import { Length } from "../../Shared/Length.js";
import { RectangleImpl } from "./RectangleImpl.js";
