import { LEN, Length } from "../../Length.js";
import { SongLineBox } from "./SongLineBox.js";
/**
 * @typedef {import("../../Song.js").SongSection} SongSection
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 */

/**
 * @typedef {object} SongSectionBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 */

/**
 * @implements {DetachedBox}
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
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    const pointer = position.getPointerAt("left", "top");
    for (const l of this.children) {
      const rightBottom = pointer.pointerDown(l.height).pointerRight(l.width);
      l.setPosition(pointer.span(rightBottom));
      pointer.moveDown(l.height);
    }
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
  }
}
