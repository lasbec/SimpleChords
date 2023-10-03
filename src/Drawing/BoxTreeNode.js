import { PDFPage, rgb } from "pdf-lib";
import { PageBox } from "./Boxes/PageBox.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { Length } from "../Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { Document } from "./Document.js";
import { BoxOverflows } from "./BoxOverflow.js";
import { FreePointer } from "./FreePointer.js";
/**
 */

/**
 * @typedef {import("./Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").BoxPlacement} BoxPlacement
 */

/**
 * @typedef {BoxTreeChildNode | BoxTreeRoot} BoxTreeNode
 */

/** @implements {Box} */
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
    box.ownBox.setParent(this.ownBox);
    this.children.push(box);
  }

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.rootPage.appendNewPage();
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
  get document() {
    return this.ownBox.document;
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
    return this.ownBox.level();
  }

  /** @param {Box} box */
  setParent(box) {
    console.error(box);
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
  getBoxPointer(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {FreePointer}
   */
  getPoint(x, y) {
    return this.ownBox.getPoint(x, y);
  }

  /** @param {BorderPosition} border  */
  getBorder(border) {
    return this.ownBox.getBorder(border);
  }

  /**
   *
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.ownBox.setPosition(position);
  }
}

/**
 */

/** @implements {Box} */
export class BoxTreeChildNode {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {Box} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;
  /** @type {BoxTreeNode[]} */
  children;

  /** @param {BoxTreeChildNode} box */
  appendChild(box) {
    box.ownBox.setParent(this.ownBox);
    this.children.push(box);
  }

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.rootPage.appendNewPage();
  }

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {Box} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.ownBox.setPosition({
      x: "left",
      y: "bottom",
      point: FreePointer.fromPoint(leftBottomCorner),
    });
    this.ownBox.setParent(parentNode.ownBox);
    this.parent = parentNode;
    this.children = [];
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }

  get document() {
    return this.ownBox.document;
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
    drawDebugBox(page, this.ownBox);
    this.ownBox.setPosition({
      x: "left",
      y: "bottom",
      point: new FreePointer(this.leftBottomCorner.x, this.leftBottomCorner.y),
    });
    this.ownBox.drawToPdfPage(page);
  }

  /** @return {number} */
  level() {
    return this.ownBox.level();
  }
  /** @param {Box} box */
  setParent(box) {
    console.error(new Error("").stack);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getBoxPointer(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {FreePointer}
   */
  getPoint(x, y) {
    return this.ownBox.getPoint(x, y);
  }

  /** @param {BorderPosition} border  */
  getBorder(border) {
    return this.ownBox.getBorder(border);
  }

  /**
   *
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.ownBox.setPosition(position);
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
      ...this.getBoxPointer("left", "bottom").rawPointIn("pt"),
      width: this.width.in("pt"),
      height: this.height.in("pt"),
      color: rgb(1, 0, 1),
      opacity: 0.5,
    });

    if (overflow.left) {
      const leftBottom = this.getBoxPointer("left", "bottom");
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
      const leftBottom = this.getBoxPointer("right", "bottom").moveLeft(
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
      const leftBottom = this.getBoxPointer("left", "top").moveDown(
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
      const leftBottom = this.getBoxPointer("left", "bottom");
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
