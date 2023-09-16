import { BoxPointer } from "./BoxPointer.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { Length } from "../../Length.js";
import { PageBox } from "./PageBox.js";

/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").IBox} IBox
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {IBox}
 * @implements {DetachedBox}
 */
export class Box {
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /** @type {Point} */
  leftBottomCorner;
  /** @type {IBox} */
  parent;

  /**
   * @param {Point} leftBottomCorner
   * @param {Dimensions} dims
   * @param {IBox} parent
   */
  constructor(leftBottomCorner, dims, parent) {
    this.width = dims.width;
    this.height = dims.height;
    this.leftBottomCorner = leftBottomCorner;
    this.parent = parent;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {PageBox}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {}
  /**
   * @param {PDFPage} pdfPage
   * @param {Point} leftBottomCorner
   */
  _drawToPdfPage(pdfPage, leftBottomCorner) {}
}
