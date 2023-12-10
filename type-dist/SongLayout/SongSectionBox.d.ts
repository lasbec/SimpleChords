export function songSection(section: SongSection, layoutConfig: LayoutConfig, rect?: Rectangle | undefined): ArragmentBox;
export type BoxPlacement = import("../Drawing/Geometry.js").ReferencePoint;
export type LayoutConfig = import("./RenderSongAsPdf.js").LayoutConfig;
export type TextConfig = import("../Drawing/TextConfig.js").TextConfig;
export type PDFPage = import("pdf-lib").PDFPage;
export type Point = import("../Drawing/Geometry.js").Point;
export type SongSection = import("../Song/Song.js").SongSection;
export type XStartPosition = import("../Drawing/Geometry.js").XStartPosition;
export type YStartPosition = import("../Drawing/Geometry.js").YStartPosition;
export type Dimensions = import("../Drawing/Geometry.js").Dimensions;
export type Box = import("../Drawing/Geometry.js").Box;
export type Rectangle = import("../Drawing/Geometry.js").Rectangle;
export type SongSectionBoxConfig = {
    chordsConfig: TextConfig;
    lyricConfig: TextConfig;
};
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";
