import { Length } from "../../Length.js";

/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").HOBox} HOBox
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {HOBox}
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
    /** @type {HOBox[]} */
    this.children = [];
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {}
}
