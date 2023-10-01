import { Length } from "../Length.js";
import { Document } from "./Document.js";
import { TextBox } from "./PrimitiveBoxes/TextBox.js";
import { DebugBox } from "./PrimitiveBoxes/DebugBox.js";
import { PlainBox } from "./Boxes/PlainBox.js";
import { BoxTreeChildNode } from "./BoxTreeNode.js";
import { FreePointer } from "./FreePointer.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("./TextConfig.js").TextConfig} TextConfig
 */

export class BoxPointer {
  /**
   * @type {FreePointer}
   * @private
   */
  freePointer;

  get x() {
    return this.freePointer.x;
  }

  get y() {
    return this.freePointer.y;
  }

  /** @type {BoxTreeNode} */
  box;

  /** @param {unknown[]} args  */
  log(...args) {
    if (Document.debug) {
      // console.log(...args);
    }
  }

  /**
   *
   * @param {Length} x
   * @param {Length} y
   * @param {BoxTreeNode} page
   * @private
   */
  constructor(x, y, page) {
    this.freePointer = new FreePointer(x, y);
    this.box = page;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {BoxTreeNode} box
   */
  static atBox(x, y, box) {
    return new BoxPointer(
      BoxPointer.xPositionOnPage(x, box),
      BoxPointer.yPositionOnPage(y, box),
      box
    );
  }

  /**
   * @param {XStartPosition} xRelative
   * @param {BoxTreeNode} box
   * @private
   */
  static xPositionOnPage(xRelative, box) {
    const width = box.width;
    const { x } = box.leftBottomCorner;
    if (xRelative === "left") return x;
    if (xRelative === "center") return x.add(width.mul(1 / 2));
    if (xRelative === "right") return x.add(width);
    throw Error("Invalid x start position.");
  }

  /**
   * @param {YStartPosition} yRelative
   * @param {BoxTreeNode} box
   * @private
   */
  static yPositionOnPage(yRelative, box) {
    const height = box.height;
    const { y } = box.leftBottomCorner;
    if (yRelative === "top") return y.add(height);
    if (yRelative === "center") return y.add(height.mul(1 / 2));
    if (yRelative === "bottom") return y;
    throw Error("Invalid y start position.");
  }

  /**
   * @param {XStartPosition} x
   * @param {Length} width
   * @private
   */
  xPositionRelativeToThis(x, width) {
    if (x === "left") return this.x.sub(width);
    if (x === "center") return this.x.sub(width.mul(1 / 2));
    if (x === "right") return this.x;
    throw Error("Invalid x start position.");
  }

  /**
   * @param {YStartPosition} y
   * @param {Length} height
   * @private
   */
  yPositionRelativeToThis(y, height) {
    if (y === "top") return this.y;
    if (y === "center") return this.y.sub(height.mul(1 / 2));
    if (y === "bottom") return this.y.sub(height);
    throw Error("Invalid y start position.");
  }

  clone() {
    return new BoxPointer(this.x, this.y, this.box);
  }

  moveToRightBorder() {
    this.freePointer.x = BoxPointer.xPositionOnPage("right", this.box);
    return this;
  }

  moveToLeftBorder() {
    this.freePointer.x = BoxPointer.xPositionOnPage("left", this.box);
    return this;
  }

  moveToTopBorder() {
    this.freePointer.y = BoxPointer.yPositionOnPage("top", this.box);
    return this;
  }

  moveToBottomBorder() {
    this.freePointer.y = BoxPointer.yPositionOnPage("bottom", this.box);
    return this;
  }

  moveHorizontalCenter() {
    this.freePointer.x = BoxPointer.xPositionOnPage("center", this.box);
    return this;
  }

  moveVerticalCenter() {
    this.freePointer.y = BoxPointer.yPositionOnPage("center", this.box);
    return this;
  }

  /**
   * @param {import("../Length.js").UnitName} unit
   */
  rawPointIn(unit) {
    return this.freePointer.rawPointIn(unit);
  }

  /** @param {Length} offset  */
  moveRight(offset) {
    this.freePointer.moveRight(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveLeft(offset) {
    this.freePointer.moveLeft(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveUp(offset) {
    this.freePointer.moveUp(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveDown(offset) {
    this.freePointer.moveDown(offset);
    return this;
  }

  /** @param {Length} offset  */
  pointerRight(offset) {
    return this.clone().moveRight(offset);
  }

  /** @param {Length} offset  */
  pointerLeft(offset) {
    return this.clone().moveLeft(offset);
  }

  /** @param {Length} offset  */
  pointerUp(offset) {
    return this.clone().moveUp(offset);
  }

  /** @param {Length} offset  */
  pointerDown(offset) {
    return this.clone().moveDown(offset);
  }

  /**
   * @returns {BoxPointer}
   */
  onPage() {
    return new BoxPointer(this.x, this.y, this.box.root);
  }

  /**
   * @returns {BoxPointer}
   */
  onParent() {
    return new BoxPointer(this.x, this.y, this.box.parent);
  }

  /**
   * @param {BoxPointer} other
   * @returns {BoxTreeChildNode}
   */
  span(other) {
    const otherRelXPos = other.isLeftFrom(this) ? "left" : "right";
    const otherRelYPos = other.isLowerThan(this) ? "bottom" : "top";
    const width = this.x.sub(other.x).abs();
    const height = this.y.sub(other.y).abs();
    return this.setPlainBox(otherRelXPos, otherRelYPos, { width, height });
  }

  /** @param {BoxPointer} other  */
  isLeftFrom(other) {
    return this.freePointer.isLeftFrom(other);
  }

  /** @param {BoxPointer} other  */
  isLowerThan(other) {
    return this.freePointer.isLowerThan(other);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  nextPageAt(x, y) {
    const nextPage = this.box.rootPage.appendNewPage();
    return BoxPointer.atBox(x, y, nextPage);
  }

  setDebug() {
    if (Document.debug) {
      const result = new DebugBox(this);
      return this.setBox("center", "center", result);
    }
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Box} box
   */
  setBox(x, y, box) {
    const xToDraw = this.xPositionRelativeToThis(x, box.width);
    const yToDraw = this.yPositionRelativeToThis(y, box.height);
    const result = new BoxTreeChildNode(
      { x: xToDraw, y: yToDraw },
      box,
      this.box
    );
    this.box.appendChild(result);
    this.box.rootPage.setBox(result);
    return result;
  }
  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Dimesions} dims
   */
  setPlainBox(x, y, dims) {
    const box = new PlainBox(dims);
    return this.setBox(x, y, box);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {string} text
   * @param {TextConfig} style
   */
  setText(x, y, text, style) {
    const textBox = new TextBox(text, style);
    return this.setBox(x, y, textBox);
  }
}
