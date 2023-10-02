import { Length } from "../../Length.js";
import { AbstractHOBox } from "../BoxDrawingUtils.js";
import { FreePointer } from "../FreePointer.js";
import { SongLineBox } from "./SongLineBox.js";
/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../../Song.js").SongSection} SongSection
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").HOBox} HOBox
 */

/**
 * @typedef {object} SongSectionBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 */

/**
 * @implements {HOBox}
 */
export class SongSectionBox extends AbstractHOBox {
  /**
   * @param {SongSection} section
   * @param {SongSectionBoxConfig} config
   */
  constructor(section, config) {
    const children = section.lines.map((l) => new SongLineBox(l, config));
    const pointer = new FreePointer(Length.zero, Length.zero);
    for (const l of children) {
      l.setPosition({
        x: "left",
        y: "top",
        point: pointer,
      });
      pointer.moveDown(l.height);
    }

    super(children);
  }
}
