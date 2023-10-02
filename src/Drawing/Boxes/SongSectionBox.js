import { Length } from "../../Length.js";
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
export class SongSectionBox {
  /**@type {SongSection}*/
  section;
  /**@type {SongSectionBoxConfig}*/
  config;
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /**
   * @param {SongSection} section
   * @param {SongSectionBoxConfig} config
   */
  constructor(section, config) {
    this.section = section;
    this.config = config;
    this.children = section.lines.map((l) => new SongLineBox(l, this.config));
    this.width = Length.max(this.children.map((l) => l.width)) || Length.zero;
    this.singleLineHeight = this.children[0]?.height || Length.zero;
    this.height = this.singleLineHeight.mul(this.children.length);
  }
  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const pointer = getPoint({
      targetX: "left",
      targetY: "top",
      corner: position,
      width: this.width,
      height: this.height,
    });
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
