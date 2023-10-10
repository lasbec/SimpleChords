import { WellKnownSectionType } from "../../SongChecker.js";
import { MutableFreePointer } from "../FreePointer.js";
import { decorateAsBox } from "../HigherOrderBox.js";
import { songLineBox } from "./SongLineBox.js";
/**
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../../Song.js").SongSection} SongSection
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 */

/**
 * @typedef {object} SongSectionBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 */

/**
 * @param {SongSection} section
 * @param {import("../../RenderSongAsPdf.js").LayoutConfig} layoutConfig
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

export const songSection = decorateAsBox(drawsongSection);
