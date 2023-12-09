export class ArragmentBox extends AbstractBox<import("../Geometry.js").Box[], null> implements ParentBox {
    static newPage(dims: Dimensions): ArragmentBox;
    static undboundBoxGroup(children: Box[]): ArragmentBox;
    static withLowerBounds(rect: Rectangle): ArragmentBox;
    static fromRect(rect: Rectangle): ArragmentBox;
    constructor(children: Box[], bounds: BoundsImpl);
    readonly __discriminator__: "parent";
    get children(): import("../Geometry.js").Box[];
    setPosition(position: BoxPlacement): void;
    appendChild(box: Box): void;
    hasOverflow(): false | BoxOverflows;
    drawToPdfPage(page: PDFPage): void;
}
export type Rectangle = import("../Geometry.js").Rectangle;
export type BoxPlacement = import("../Geometry.js").ReferencePoint;
export type Box = import("../Geometry.js").Box;
export type BoxGenerator = import("../Geometry.js").RectangleGenerator;
export type ParentBox = import("../Geometry.js").ParentBox;
export type ReferencePoint = import("../Geometry.js").ReferencePoint;
export type RectangleRestrictions = import("../Geometry.js").Bounds;
export type Dimensions = import("../Geometry.js").Dimensions;
import { AbstractBox } from "./AbstractBox.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { PDFPage } from "pdf-lib";
import { BoundsImpl } from "../Figures/BoundsImpl.js";
