export class SongLineBox extends AbstractBox<SongLine, SongLineBoxConfig> implements LeaveBox, StrLikeConstraint {
    static slice(s: SongLineBox, start: number, stop?: number | undefined): SongLineBox;
    static concat(s: SongLineBox[]): SongLineBox;
    static emptyAt(box: SongLineBox, i: number): boolean | undefined;
    static empty(style: SongLineBoxConfig): SongLineBox;
    constructor(content: SongLine, style: SongLineBoxConfig);
    __discriminator__: "leave";
    box: ArragmentBox;
    private _ancestors;
    ancestors(): SongLineBox[];
    hasOverflow(): false | import("../Drawing/BoxOverflow.js").BoxOverflows;
    setPosition(point: ReferencePoint): void;
    drawToPdfPage(page: PDFPage): void;
    get length(): number;
    charAt(i: number): string;
    private initChildren;
    maxChordsToFitInWidth(width: Length): number;
    maxCharsToFit(width: Length): number;
    private partialWidthsOfLyricOnly;
    [Symbol.iterator](): Iterator<string, any, undefined>;
}
export type ChordConfig = import("./ChordBox.js").ChordConfig;
export type PDFPage = import("pdf-lib").PDFPage;
export type TextConfig = import("../Drawing/TextConfig.js").TextConfig;
export type ReferencePoint = import("../Drawing/Geometry.js").ReferencePoint;
export type Point = import("../Drawing/Geometry.js").Point;
export type XStartPosition = import("../Drawing/Geometry.js").XStartPosition;
export type YStartPosition = import("../Drawing/Geometry.js").YStartPosition;
export type Dimensions = import("../Drawing/Geometry.js").Dimensions;
export type Box = import("../Drawing/Geometry.js").Box;
export type PrimitiveBox = import("../Drawing/Geometry.js").Box;
export type LeaveBox = import("../Drawing/Geometry.js").LeaveBox;
export type StrLikeConstraint = import("../Drawing/BreakableText.js").StrLikeConstraint;
export type SongLineBoxConfig = {
    lyricConfig: TextConfig;
    chordsConfig: ChordConfig;
};
import { SongLine } from "../Song/SongLine.js";
import { AbstractBox } from "../Drawing/Boxes/AbstractBox.js";
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";
import { Length } from "../Shared/Length.js";
