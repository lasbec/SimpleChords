export class PartialRectangleImpl implements PartialRectangle {
    static fromBound(bounds: BoundsImpl, minMax: import("./BoundsImpl.js").MinMax): PartialRectangleImpl;
    static fromBorders({ left, right, top, bottom }: BorderArgs): PartialRectangleImpl;
    private constructor();
    private def;
    get width(): import("../../Shared/Length.js").Length | undefined;
    get height(): import("../../Shared/Length.js").Length | undefined;
    toFullRectangle(): RectangleImpl;
    clone(): PartialRectangleImpl;
    getBorder(position: import("../Geometry.js").BorderPosition): HLineImpl | VLineImpl | undefined;
    getBorderVertical(position: "left" | "right"): VLineImpl | undefined;
    getBorderHorizontal(position: "bottom" | "top"): HLineImpl | undefined;
}
export type XStartPosition = import("../Geometry.js").XStartPosition;
export type YStartPosition = import("../Geometry.js").YStartPosition;
export type Point = import("../Geometry.js").Point;
export type MutRectangle = import("../Geometry.js").MutRectangle;
export type PartialRectangle = import("../Geometry.js").PartialRectangle;
export type Rectangle = import("../Geometry.js").Rectangle;
export type Dimensions = import("../Geometry.js").Dimensions;
export type ReferencePoint = import("../Geometry.js").ReferencePoint;
export type BorderArgs = {
    left: VLineImpl | undefined;
    right: VLineImpl | undefined;
    top: HLineImpl | undefined;
    bottom: HLineImpl | undefined;
};
import { RectangleImpl } from "./RectangleImpl.js";
import { HLineImpl } from "./HLineImpl.js";
import { VLineImpl } from "./VLineImpl.js";
import { BoundsImpl } from "./BoundsImpl.js";
