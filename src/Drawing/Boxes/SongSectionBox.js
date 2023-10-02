import { Length } from "../../Length.js";
import { AbstractBox } from "../BoxDrawingUtils.js";
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
export class SongSectionBox extends AbstractBox {
  /**@type {SongSection}*/
  section;
  /**@type {SongSectionBoxConfig}*/
  config;

  /**
   * @param {SongSection} section
   * @param {SongSectionBoxConfig} config
   */
  constructor(section, config) {
    const children = section.lines.map((l) => new SongLineBox(l, this.config));
    const singleLineHeight = children[0]?.height || Length.zero;
    const height = singleLineHeight.mul(children.length);
    super({
      width: Length.max(children.map((l) => l.width)) || Length.zero,
      height,
    });
    this.children = children;
    this.section = section;
    this.config = config;
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
