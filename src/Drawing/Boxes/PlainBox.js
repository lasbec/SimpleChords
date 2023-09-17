import { Length } from "../../Length.js";

/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {DetachedBox}
 */
export class PlainBox {
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /**
   * @param {Dimensions} dims
   */
  constructor(dims) {
    this.width = dims.width;
    this.height = dims.height;
  }

  /**
   * @param {PDFPage} pdfPage
   * @param {import("./Geometry.js").BoxPosition} position
   */
  drawToPdfPage(pdfPage, position) {}
}
