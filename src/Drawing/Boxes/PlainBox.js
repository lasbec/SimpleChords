import { Length } from "../../Length.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { FreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {Box}
 */
export class PlainBox extends AbstractPrimitiveBox {
  /**
   * @param {Dimensions} dims
   */
  constructor(dims) {
    super(dims, {
      x: "left",
      y: "bottom",
      point: FreePointer.origin(),
    });
    /** @type {Box[]} */
    this.children = [];
  }

  /**
   *
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {}
}
