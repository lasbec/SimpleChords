import { Length } from "../../Length.js";
import { AbstractPrimitiveBox } from "../BoxDrawingUtils.js";

/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
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
export class PlainBox extends AbstractPrimitiveBox {
  /**
   * @param {Dimensions} dims
   */
  constructor(dims) {
    super(dims);
    /** @type {HOBox[]} */
    this.children = [];
  }
}
