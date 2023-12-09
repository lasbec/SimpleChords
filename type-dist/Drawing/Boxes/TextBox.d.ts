export class TextBox extends PrimitiveBox<string, import("../TextConfig.js").TextConfig> implements LeaveBox {
    constructor(text: string, style: TextConfig, position?: ReferencePoint | undefined);
    position: import("../Geometry.js").ReferencePoint;
    hasOverflow(): false;
    setPosition(position: ReferencePoint): void;
    drawToPdfPage(pdfPage: PDFPage): void;
    partialWidths(): import("../../Shared/Length.js").Length[];
}
export type ReferencePoint = import("../Geometry.js").ReferencePoint;
export type TextConfig = import("../TextConfig.js").TextConfig;
export type PDFPage = import("pdf-lib").PDFPage;
export type Point = import("../Geometry.js").Point;
export type BoxPlacement = import("../Geometry.js").ReferencePoint;
export type XStartPosition = import("../Geometry.js").XStartPosition;
export type YStartPosition = import("../Geometry.js").YStartPosition;
export type Dimensions = import("../Geometry.js").Dimensions;
export type LeaveBox = import("../Geometry.js").LeaveBox;
import { PrimitiveBox } from "./PrimitiveBox.js";
