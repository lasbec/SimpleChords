import { PDFPage } from "pdf-lib";
import { PageBox } from "./PageBox.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";

/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").IBox} IBox
 *
 */

/**
 * @implements {IBox}
 * @implements {DetachedBox}
 */
export class BoxTreeNode {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {DetachedBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parentNode;

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {DetachedBox} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.parentNode = parentNode;
  }

  /**
   * @returns {IBox}
   */
  get parent() {
    return this.parentNode;
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }

  /** @returns {PageBox} */
  get rootPage() {
    if (this.ownBox instanceof PageBox) {
      return this.ownBox;
    }
    return this.parentNode.rootPage;
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    drawDebugBox(page, this);
    this.ownBox._drawToPdfPage(page, this.leftBottomCorner);
  }

  /**
   * @param {PDFPage} page
   * @param {Point} leftBottomCorner
   */
  _drawToPdfPage(page, leftBottomCorner) {
    this.drawToPdfPage(page);
  }

  /** @return {number} */
  level() {
    if (this.ownBox instanceof PageBox) {
      return 0;
    }
    return 1 + this.parentNode.level();
  }
}
