import { PDFPage } from "pdf-lib";
import { PageBox } from "./PageBox.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { Length } from "../../Length.js";
import { BoxPointer } from "./BoxPointer.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 */

/**
 * @typedef {BoxTreeChildNode | BoxTreeRoot} BoxTreeNode
 */

export class BoxTreeRoot {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {PageBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;

  /**
   * @param {PageBox} ownBox
   */
  constructor(ownBox) {
    this.leftBottomCorner = {
      x: Length.zero,
      y: Length.zero,
    };
    this.ownBox = ownBox;
    this.parent = this;
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }

  /** @return {BoxTreeRoot} */
  get root() {
    return this;
  }

  /** @returns {PageBox} */
  get rootPage() {
    return this.ownBox;
  }

  /** @return {number} */
  level() {
    return 0;
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    drawDebugBox(page, this);
    this.ownBox.drawToPdfPage(page);
  }

  /**
   *
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {Point}
   */
  getCoordinates(x, y) {
    const pointer = this.getPointerAt(x, y);
    return {
      x: pointer.x,
      y: pointer.y,
    };
  }
}

export class BoxTreeChildNode {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {DetachedBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {DetachedBox} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.parent = parentNode;
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }

  /** @return {BoxTreeRoot} */
  get root() {
    return this.parent.root;
  }

  /** @returns {PageBox} */
  get rootPage() {
    return this.root.ownBox;
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    drawDebugBox(page, this);
    this.ownBox.drawToPdfPage(page, this);
  }

  /** @return {number} */
  level() {
    if (this.ownBox instanceof PageBox) {
      return 0;
    }
    return 1 + this.parent.level();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }
}
