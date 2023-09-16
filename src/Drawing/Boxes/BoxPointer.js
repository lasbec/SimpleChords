import { LEN, Length } from "../../Length.js";
import { Document } from "../Document.js";
import { TextBox } from "./TextBox.js";
import { DebugBox } from "./DebugBox.js";
import { Box } from "./Box.js";
import { BoxTreeChildNode, BoxTreeRoot } from "./BoxTreeNode.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Types.js").TextConfig} TextConfig
 */

/**
 * @typedef {object} BoxStruct
 * @property {Point} leftBottomCorner
 * @property {Length} width
 * @property {Length} height
 */

/**
 * @typedef {object} OverflowCalcArgs
 * @property {BoxStruct} parent
 * @property {BoxStruct} child
 */

/**
 * @typedef {object} BoxOverflowsConstructorArgs
 * @property {Length} left
 * @property {Length} right
 * @property {Length} bottom
 * @property {Length} top
 */
export class BoxOverflows {
  /** @type {Length}*/
  left;
  /** @type {Length}*/
  right;
  /** @type {Length}*/
  bottom;
  /** @type {Length}*/
  top;

  /**
   * @param {BoxOverflowsConstructorArgs} args
   */
  constructor(args) {
    this.left = args.left;
    this.right = args.right;
    this.bottom = args.bottom;
    this.top = args.top;
  }

  isEmpty() {
    return (
      this.top.isZero() &&
      this.bottom.isZero() &&
      this.left.isZero() &&
      this.right.isZero()
    );
  }

  /** @param {OverflowCalcArgs} args */
  static from(args) {
    const box = args.child;
    const rightBorder = box.leftBottomCorner.x.add(box.width);
    const leftBorder = box.leftBottomCorner.x;
    const topBorder = box.leftBottomCorner.y.add(box.height);
    const bottomBorder = box.leftBottomCorner.y;

    const parent = args.parent;
    const parentRightBorder = parent.leftBottomCorner.x.add(parent.width);
    const parentLeftBorder = parent.leftBottomCorner.x;
    const parentTopBorder = parent.leftBottomCorner.y.add(parent.height);
    const parentBottomBorder = parent.leftBottomCorner.y;

    return new BoxOverflows({
      right: rightBorder.sub(parentRightBorder).atLeastZero(),
      left: parentLeftBorder.sub(leftBorder).atLeastZero(),
      top: topBorder.sub(parentTopBorder).atLeastZero(),
      bottom: parentBottomBorder.sub(bottomBorder).atLeastZero(),
    });
  }

  toString() {
    let result = [];
    if (this.bottom.gtz()) {
      result.push("bottom");
    }
    if (this.top.gtz()) {
      result.push("top");
    }
    if (this.left.gtz()) {
      result.push("left");
    }
    if (this.right.gtz()) {
      result.push("right");
    }
    return `BoxOverflow at: ` + result.join(", ") + ".";
  }
}

/** @param {BoxTreeNode} box */
function assertBoxIsInsideParent(box) {
  const overflows = BoxOverflows.from({ child: box, parent: box.parent });
  if (!overflows.isEmpty()) {
    throw new Error(overflows.toString());
  }
}

export class BoxPointer {
  /**
   * @type {Length}
   */
  x;
  /**
   * @type {Length}
   */
  y;
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
    this.x = x;
    this.y = y;
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

  /** @param {Length} offset  */
  moveRight(offset) {
    this.x = this.x.add(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveLeft(offset) {
    this.x = this.x.sub(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveUp(offset) {
    this.y = this.y.add(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveDown(offset) {
    this.y = this.y.sub(offset);
    return this;
  }

  moveToRightBorder() {
    this.x = BoxPointer.xPositionOnPage("right", this.box);
    return this;
  }

  moveToLeftBorder() {
    this.x = BoxPointer.xPositionOnPage("left", this.box);
    return this;
  }

  moveToTopBorder() {
    this.y = BoxPointer.yPositionOnPage("top", this.box);
    return this;
  }

  moveToBottomBorder() {
    this.y = BoxPointer.yPositionOnPage("bottom", this.box);
    return this;
  }

  moveHorizontalCenter() {
    this.x = BoxPointer.xPositionOnPage("center", this.box);
    return this;
  }

  moveVerticalCenter() {
    this.y = BoxPointer.yPositionOnPage("center", this.box);
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
  spanBox(other) {
    const otherRelXPos = other.isLeftFrom(this) ? "left" : "right";
    const otherRelYPos = other.isLowerThan(this) ? "bottom" : "top";
    const width = this.x.sub(other.x).abs();
    const height = this.y.sub(other.y).abs();
    return this.setBox(otherRelXPos, otherRelYPos, { width, height });
  }

  /** @param {BoxPointer} other  */
  isLeftFrom(other) {
    return this.x.lt(other.x);
  }

  /** @param {BoxPointer} other  */
  isLowerThan(other) {
    return this.y.lt(other.y);
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
      const result = new DebugBox({ x: this.x, y: this.y });
      return this._setBox("center", "center", result);
    }
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Dimesions} dims
   * @returns {Box | BoxOverflows}
   */
  trySetBox(x, y, dims) {
    const { width, height } = dims;
    const xToDraw = this.xPositionRelativeToThis(x, width);
    const yToDraw = this.yPositionRelativeToThis(y, height);

    const overflows = BoxOverflows.from({
      child: { leftBottomCorner: { x: xToDraw, y: yToDraw }, width, height },
      parent: this.box,
    });
    return overflows.isEmpty() ? this.setBox(x, y, dims) : overflows;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {DetachedBox} box
   */
  _setBox(x, y, box) {
    const xToDraw = this.xPositionRelativeToThis(x, box.width);
    const yToDraw = this.yPositionRelativeToThis(y, box.height);
    const result = new BoxTreeChildNode(
      { x: xToDraw, y: yToDraw },
      box,
      this.box
    );
    this.box.rootPage.setBox(result);
    this.log(
      "Set Box at:",
      {
        x: xToDraw.in("mm"),
        y: yToDraw.in("mm"),
        width: box.width.in("mm"),
        heigh: box.height.in("mm"),
        wa: result.width.in("mm"),
        hb: result.height.in("mm"),
        xa: result.leftBottomCorner.x.in("mm"),
        xb: result.leftBottomCorner.y.in("mm"),
      },
      "\n"
    );
    this.doOverflowManagement(result);
    return result;
  }
  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Dimesions} dims
   */
  setBox(x, y, dims) {
    const box = new Box(dims);
    return this._setBox(x, y, box);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {string} text
   * @param {TextConfig} style
   */
  setText(x, y, text, style) {
    const textBox = new TextBox(text, style);
    return this._setBox(x, y, textBox);
  }

  /** @param {BoxTreeNode} box*/
  doOverflowManagement(box) {
    if (!Document.debug) assertBoxIsInsideParent(box);
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (overflows.isEmpty()) return;
    console.error("Overflow detecded", overflows.toString());
  }
}
