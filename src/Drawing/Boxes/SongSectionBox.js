import { Length } from "../../Length.js";
import { AbstractHOBox } from "../BoxDrawingUtils.js";
import { getPoint } from "../BoxMeasuringUtils.js";
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
  /**@type {SongSection}*/
  section;
  /**@type {SongSectionBoxConfig}*/
  config;

  /**
   * @param {SongSection} section
   * @param {SongSectionBoxConfig} config
   */
  constructor(section, config) {
    const children = section.lines.map((l) => new SongLineBox(l, config));
    super(children);
    this.section = section;
    this.config = config;
  }
  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    super.setPosition(position);
    const pointer = this.getPoint("left", "top");
    for (const l of this.children) {
      l.setPosition({
        x: "left",
        y: "top",
        point: pointer,
      });
      pointer.moveDown(l.height);
    }
  }
}
