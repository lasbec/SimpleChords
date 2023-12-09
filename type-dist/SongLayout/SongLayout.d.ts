export function songLayout(song: Song, layoutConfig: LayoutConfig, rectGen: RectangleGenerator): {
    boxes: Box[];
    generatorState: RectangleGenerator;
};
export function songLayoutSimple(song: Song, layoutConfig: LayoutConfig, rectGen: RectangleGenerator): Box[];
export function songLayoutDoubleLine(song: Song, layoutConfig: LayoutConfig, rect: RectangleGenerator): Box[];
export function songLayoutAdjustable(song: Song, layoutConfig: LayoutConfig, rectGen: RectangleGenerator, fn: (songSections: {
    section: SongSection;
    result: ArragmentBox;
}[], style: SongLineBoxConfig) => void): Box[];
export type RectangleGenerator = import("../Drawing/Geometry.js").RectangleGenerator;
export type WorkingLine = {
    rest: BreakableText<SongLineBox>;
    result: ArragmentBox;
};
export type SongSection = import("./SongSectionBox.js").SongSection;
export type SongLineBoxConfig = import("./SongLineBox.js").SongLineBoxConfig;
export type Rectangle = import("../Drawing/Geometry.js").Rectangle;
export type Box = import("../Drawing/Geometry.js").Box;
export type LayoutConfig = import("./RenderSongAsPdf.js").LayoutConfig;
export type BoxGen = import("../Drawing/Geometry.js").RectangleGenerator;
import { Song } from "../Song/Song.js";
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";
import { BreakableText } from "../Drawing/BreakableText.js";
import { SongLineBox } from "./SongLineBox.js";
