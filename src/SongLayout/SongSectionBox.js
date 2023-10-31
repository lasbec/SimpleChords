import { WellKnownSectionType } from "../Song/SongChecker.js";
import { MutableFreePointer } from "../Drawing/FreePointer.js";
import { decorateAsBox } from "../Drawing/Boxes/DynamicSizedBox.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { songLineBox } from "./SongLineBox.js";
/**
 * @typedef {import("../Drawing/Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/Geometry.js").Point} Point
 * @typedef {import("../Song/Song.js").SongSection} SongSection
 * @typedef {import("../Drawing/Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Drawing/Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Drawing/Geometry.js").RectNoBottom} RectNoBottom */

/**
 * @typedef {object} SongSectionBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 */

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {MutableFreePointer} startPoint
 */
function drawsongSection(section, layoutConfig, startPoint) {
  const sectionType = section.type;
  /** @type {TextConfig} */
  const lyricStyle =
    sectionType === WellKnownSectionType.Chorus
      ? layoutConfig.chorusTextConfig
      : sectionType === WellKnownSectionType.Refrain
      ? layoutConfig.refTextConfig
      : layoutConfig.lyricTextConfig;
  const chordTextConfig = layoutConfig.chordTextConfig;
  const config = {
    chordsConfig: chordTextConfig,
    lyricConfig: lyricStyle,
  };
  const children = section.lines.map((l) => songLineBox(l, config));
  for (const l of children) {
    l.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: startPoint,
    });
    startPoint.moveDown(l.rectangle.height);
  }
  return children;
}

const songSectionWithLyric = decorateAsBox(drawsongSection);

const songSectionInstrumental = decorateAsBox(drawOnlyChords);

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {RectNoBottom=} rect
 * @returns
 */
export function songSection(section, layoutConfig, rect) {
  const onlyChordsSections = [
    WellKnownSectionType.Intro,
    WellKnownSectionType.Outro,
    WellKnownSectionType.Interlude,
  ];
  const sectionBox = onlyChordsSections.includes(section.type)
    ? songSectionInstrumental(section, layoutConfig)
    : songSectionWithLyric(section, layoutConfig);
  if (rect) {
    sectionBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: rect.getPoint("left", "top"),
    });
  }
  return sectionBox;
}

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {MutableFreePointer} pointer
 * @returns
 */
function drawOnlyChords(section, layoutConfig, pointer) {
  const title = section.type + "   ";
  const songLines = section.lines;
  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = chordTextConfig.lineHeight;

  const lines = [];
  for (const line of songLines) {
    const text = title + line.chords.map((c) => c.chord).join(" ");
    const textBox = new TextBox(text, layoutConfig.chordTextConfig);
    textBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: pointer.clone(),
    });
    pointer.moveDown(chordLineHeight);
    lines.push(textBox);
  }
  return lines;
}
