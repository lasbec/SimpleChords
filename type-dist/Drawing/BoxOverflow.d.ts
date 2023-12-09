export class BoxOverflows {
    static from(args: OverflowCalcArgs): BoxOverflows;
    static assertBoxIsInsideParent(box: Box): void;
    static doOverflowManagement(page: PDFPage, box: Box): void;
    static drawOverflowMarker(page: PDFPage, box: Box, overflow: BoxOverflows): void;
    constructor(args: BoxOverflowsConstructorArgs);
    left: Length;
    right: Length;
    bottom: Length;
    top: Length;
    isEmpty(): boolean;
    toString(): string;
}
export type Point = import("./Geometry.js").Point;
export type XStartPosition = import("./Geometry.js").XStartPosition;
export type YStartPosition = import("./Geometry.js").YStartPosition;
export type Box = import("./Geometry.js").Box;
export type Dimesions = import("./Geometry.js").Dimensions;
export type TextConfig = import("./TextConfig.js").TextConfig;
export type OverflowCalcArgs = {
    parent: Box | null;
    child: Box;
};
export type BoxOverflowsConstructorArgs = {
    left: Length;
    right: Length;
    bottom: Length;
    top: Length;
};
import { Length } from "../Shared/Length.js";
import { PDFPage } from "pdf-lib";
