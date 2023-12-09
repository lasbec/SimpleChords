export class AbstractBox<Content, Style> {
    constructor(content: Content, style: Style, bounds: BoundsImpl);
    content: Content;
    style: Style;
    bounds: BoundsImpl;
    parent: Box | null;
    get root(): import("../Geometry.js").Box;
    level(): number;
    dims(): Dimensions;
    get rectangle(): import("../Geometry.js").Rectangle;
    referencePoint(): import("../Geometry.js").ReferencePoint;
}
export type RectangleRestrictions = import("../Geometry.js").Bounds;
export type Rectangle = import("../Geometry.js").Rectangle;
export type MutRectangle = import("../Geometry.js").MutRectangle;
export type BorderPosition = import("../Geometry.js").BorderPosition;
export type XRel = import("../Geometry.js").XStartPosition;
export type YRel = import("../Geometry.js").YStartPosition;
export type BoxPlacement = import("../Geometry.js").ReferencePoint;
export type Dimensions = import("../Geometry.js").Dimensions;
export type Box = import("../Geometry.js").Box;
export type LeaveBox = import("../Geometry.js").LeaveBox;
import { BoundsImpl } from "../Figures/BoundsImpl.js";
