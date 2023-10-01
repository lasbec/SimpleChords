import { PDFPage, rgb } from "pdf-lib";
import { PageBox } from "./Boxes/PageBox.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { Length } from "../Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { Document } from "./Document.js";
import { BoxOverflows } from "./BoxOverflow.js";
import { FreeBoxPosition } from "./FreeBoxPosition.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").PrimitiveBox} PrimitiveBox
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
  /** @type {BoxTreeNode[]} */
  children;

  /** @param {BoxTreeChildNode} box */
  appendChild(box) {
    this.children.push(box);
  }

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
    this.children = [];
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
  /** @type {PrimitiveBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;
  /** @type {BoxTreeNode[]} */
  children;

  /** @param {BoxTreeChildNode} box */
  appendChild(box) {
    this.children.push(box);
  }

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {PrimitiveBox} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.parent = parentNode;
    this.children = [];
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
    this.doOverflowManagement(page, this);
    drawDebugBox(page, this);
    this.ownBox.setPosition(this);
    this.ownBox.drawToPdfPage(page);
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

  /**
   * @param {PDFPage} page
   * @param {BoxTreeNode} box
   * */
  doOverflowManagement(page, box) {
    if (!Document.debug) BoxOverflows.assertBoxIsInsideParent(box);
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (overflows.isEmpty()) return;
    this.drawOverflowMarker(page, overflows);
    console.error("Overflow detecded", overflows.toString());
  }

  /**
   * @param {PDFPage} page
   * @param {BoxOverflows} overflow
   */
  drawOverflowMarker(page, overflow) {
    page.drawRectangle({
      ...this.getPointerAt("left", "bottom").rawPointIn("pt"),
      width: this.width.in("pt"),
      height: this.height.in("pt"),
      color: rgb(1, 0, 1),
      opacity: 0.5,
    });

    if (overflow.left) {
      const leftBottom = this.getPointerAt("left", "bottom");
      const height = this.height;
      const width = overflow.left;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.right) {
      const leftBottom = this.getPointerAt("right", "bottom").moveLeft(
        overflow.right
      );
      const height = this.height;
      const width = overflow.right;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.top) {
      const leftBottom = this.getPointerAt("left", "top").moveDown(
        overflow.top
      );
      const height = overflow.top;
      const width = this.width;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.bottom) {
      const leftBottom = this.getPointerAt("left", "bottom");
      const heigth = overflow.bottom;
      const width = this.width;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: heigth.in("pt"),
        color: rgb(0, 1, 0),
      });
    }
  }
}
