import { Length } from "../../Length.js";

/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
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
    this.leftTopPointer = null;
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    this.leftTopPointer = position.getPointerAt("left", "top");
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const pointer = this.leftTopPointer;
    if (!pointer) {
      throw Error("Position not set.");
    }
  }
}
