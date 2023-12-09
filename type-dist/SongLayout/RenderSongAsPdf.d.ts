export function renderSingleFile(path: string, outPath: string, layoutConfigDto: LayoutConfigDto, debug: boolean): Promise<void>;
export function renderAllInSingleFile(paths: string[], outPath: string, layoutConfigDto: LayoutConfigDto, debug: boolean): Promise<void>;
export function renderSongAsPdf(songs: Song[], debug: boolean, layoutConfig: LayoutConfig, pdfDoc: PDFDocument): Promise<Uint8Array>;
export type PDFPage = import("pdf-lib").PDFPage;
export type SongSection = import("../Song/Song.js").SongSection;
export type Box = import("../Drawing/Geometry.js").Box;
export type RectangleGenerator = import("../Drawing/Geometry.js").RectangleGenerator;
export type ChordConfig = import("./ChordBox.js").ChordConfig;
export type Dims = import("../Drawing/Geometry.js").Dimensions;
export type LengthDto = import("../Shared/Length.js").LengthDto;
export type TextConfigDto = import("../Drawing/TextConfig.js").TextConfigDto;
export type LayoutConfigDto = {
    lyricTextConfig: TextConfigDto;
    chorusTextConfig: TextConfigDto;
    refTextConfig: TextConfigDto;
    titleTextConfig: TextConfigDto;
    chordTextConfig: TextConfigDto;
    unifyChords?: boolean | undefined;
    printPageNumbers: boolean;
    firstPage?: ("left" | "right") | undefined;
    tableOfContents?: string | undefined;
    outerMargin: LengthDto;
    innerMargin: LengthDto;
    topMargin: LengthDto;
    bottomMargin: LengthDto;
    pageWidth: LengthDto;
    pageHeight: LengthDto;
    sectionDistance: LengthDto;
};
export type LayoutConfig = {
    lyricTextConfig: TextConfig;
    chorusTextConfig: TextConfig;
    refTextConfig: TextConfig;
    titleTextConfig: TextConfig;
    chordTextConfig: TextConfig;
    unifyChords: boolean;
    printPageNumbers: boolean;
    firstPage: "left" | "right";
    tableOfContents: string;
    outerMargin: Length;
    innerMargin: Length;
    topMargin: Length;
    bottomMargin: Length;
    pageWidth: Length;
    pageHeight: Length;
    sectionDistance: Length;
};
import { Song } from "../Song/Song.js";
import { PDFDocument } from "pdf-lib";
import { TextConfig } from "../Drawing/TextConfig.js";
import { Length } from "../Shared/Length.js";
