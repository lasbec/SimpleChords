export class BoundsImpl {
    static unbound(): BoundsImpl;
    static exactBoundsFrom(rect: Rectangle): BoundsImpl;
    static minBoundsFrom(rect: Rectangle): BoundsImpl;
    static maxBoundsFrom(rect: Rectangle): BoundsImpl;
    static from(restrictions: Bounds): BoundsImpl;
    private constructor();
    verticalBounds: Restrictions1D;
    horizontalBounds: Restrictions1D;
    move(move: RelativeMovement): void;
    top(minMax: MinMax): HLineImpl | undefined;
    bottom(minMax: MinMax): HLineImpl | undefined;
    height(minMax: MinMax): Length | undefined;
    left(minMax: MinMax): VLineImpl | undefined;
    right(minMax: MinMax): VLineImpl | undefined;
    width(minMax: MinMax): Length | undefined;
}
export type Rectangle = import("../Geometry.js").Rectangle;
export type IntervalRestrictons = import("../Geometry.js").IntervalRestrictions;
export type Bounds = import("../Geometry.js").Bounds;
export type MinMax = "min" | "max";
declare class Restrictions1D {
    constructor(args: IntervalRestrictons);
    private _maxValue;
    private _minValue;
    private _maxUpper;
    private _minUpper;
    private _maxLower;
    private _minLower;
    add(val: Length): Restrictions1D;
    value(minMax: MinMax): Length | undefined;
    upper(minMax: MinMax): Length | undefined;
    lower(minMax: MinMax): Length | undefined;
    private maxValue;
    private minValue;
    private maxUpper;
    private minUpper;
    private maxLower;
    private minLower;
}
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { HLineImpl } from "./HLineImpl.js";
import { Length } from "../../Shared/Length.js";
import { VLineImpl } from "./VLineImpl.js";
export {};
