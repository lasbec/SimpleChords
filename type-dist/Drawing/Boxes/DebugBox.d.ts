export class DebugBox extends PrimitiveBox<null, null> implements LeaveBox {
    static constructionCounter: number;
    constructor(center: Point);
    constructCount: number;
    position: ReferencePoint;
    hasOverflow(): false;
    setPosition(postion: ReferencePoint): void;
    drawToPdfPage(pdfPage: PDFPage): void;
}
export type PDFPage = import("pdf-lib").PDFPage;
export type Point = import("../Geometry.js").Point;
export type BoxPlacement = import("../Geometry.js").ReferencePoint;
export type XStartPosition = import("../Geometry.js").XStartPosition;
export type YStartPosition = import("../Geometry.js").YStartPosition;
export type LeaveBox = import("../Geometry.js").LeaveBox;
export type ReferencePoint = import("../Geometry.js").ReferencePoint;
export type Dimesions = import("../Geometry.js").Dimensions;
import { PrimitiveBox } from "./PrimitiveBox.js";
