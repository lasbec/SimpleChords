/**
 * @typedef {import("././Length.js").Length} Lenght
 * @typedef {import("./Page.js").IBox} IBox
 * @typedef {import("./Page.js").Dimesions}  Dimesions
 * @typedef {import("./Page.js").XStartPosition} XStartPosition
 * @typedef {import("./Page.js").YStartPosition} YStartPosition
 * @typedef {import("./Page.js").Point} Point
 * @typedef {import("./Page.js").TextConfig} TextStyle
 */
import { LEN } from "./Length.js";
import { Box, DebugBox, DetachedTextBox, Document, TextBox } from "./Page.js";

/**
 * @typedef {object} BoxStruct
 * @property {Point} leftBottomCorner
 * @property {Lenght} width
 * @property {Lenght} height
 */

/**
 * @typedef {object} OverflowCalcArgs
 * @property {BoxStruct} parent
 * @property {BoxStruct} child
 */

/**
 * @typedef {object} BoxOverflowsConstructorArgs
 * @property {Lenght} left
 * @property {Lenght} right
 * @property {Lenght} bottom
 * @property {Lenght} top
 */
export class BoxOverflows {
  /** @type {Lenght}*/
  left;
  /** @type {Lenght}*/
  right;
  /** @type {Lenght}*/
  bottom;
  /** @type {Lenght}*/
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

/** @param {IBox} box */
function assertBoxIsInsideParent(box) {
  const overflows = BoxOverflows.from({ child: box, parent: box.parent });
  if (!overflows.isEmpty()) {
    throw new Error(overflows.toString());
  }
}

export class BoxPointer {
  /**
   * @type {Lenght}
   */
  x;
  /**
   * @type {Lenght}
   */
  y;
  /** @type {IBox} */
  box;

  /** @param {unknown[]} args  */
  log(...args) {
    if (Document.debug) {
      // console.log(...args);
    }
  }

  /**
   *
   * @param {Lenght} x
   * @param {Lenght} y
   * @param {IBox} page
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
   * @param {IBox} box
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
   * @param {IBox} box
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
   * @param {IBox} box
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
   * @param {Lenght} width
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
   * @param {Lenght} height
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

  /** @param {Lenght} offset  */
  moveRight(offset) {
    this.x = this.x.add(offset);
    return this;
  }

  /** @param {Lenght} offset  */
  moveLeft(offset) {
    this.x = this.x.sub(offset);
    return this;
  }

  /** @param {Lenght} offset  */
  moveUp(offset) {
    this.y = this.y.add(offset);
    return this;
  }

  /** @param {Lenght} offset  */
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

  /** @param {Lenght} offset  */
  pointerRight(offset) {
    return this.clone().moveRight(offset);
  }

  /** @param {Lenght} offset  */
  pointerLeft(offset) {
    return this.clone().moveLeft(offset);
  }

  /** @param {Lenght} offset  */
  pointerUp(offset) {
    return this.clone().moveUp(offset);
  }

  /** @param {Lenght} offset  */
  pointerDown(offset) {
    return this.clone().moveDown(offset);
  }

  /**
   * @returns {BoxPointer}
   */
  onPage() {
    return new BoxPointer(this.x, this.y, this.box.rootPage());
  }

  /**
   * @returns {BoxPointer}
   */
  onParent() {
    return new BoxPointer(this.x, this.y, this.box.parent);
  }

  /**
   * @param {BoxPointer} other
   * @returns {Box}
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
    return this.box.rootPage().appendNewPage().getPointerAt(x, y);
  }

  setDebug() {
    if (Document.debug) {
      const result = new DebugBox({ x: this.x, y: this.y }, this.box);
      this.box.rootPage().setBox(result);
      return result;
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
   * @param {Dimesions} dims
   */
  setBox(x, y, dims) {
    const xToDraw = this.xPositionRelativeToThis(x, dims.width);
    const yToDraw = this.yPositionRelativeToThis(y, dims.height);
    const result = new Box({ x: xToDraw, y: yToDraw }, dims, this.box);
    this.box.rootPage().setBox(result);
    this.log(
      "Set Box at:",
      {
        x: xToDraw.in("mm"),
        y: yToDraw.in("mm"),
        width: dims.width.in("mm"),
        heigh: dims.height.in("mm"),
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
   * @param {string} text
   * @param {TextStyle} style
   */
  setText(x, y, text, style) {
    const { font, fontSize } = style;
    const height = LEN(font.heightAtSize(fontSize.in("pt")), "pt");
    const width = LEN(font.widthOfTextAtSize(text, fontSize.in("pt")), "pt");
    const xToDraw = this.xPositionRelativeToThis(x, width);
    const yToDraw = this.yPositionRelativeToThis(y, height);

    this.log(
      "Set Text at:",
      { x: xToDraw.in("mm"), y: yToDraw.in("mm"), text },
      "\n"
    );

    const textBox = new TextBox(
      {
        x: xToDraw,
        y: yToDraw,
      },
      text,
      style,
      this.box
    );
    this.box.rootPage().setBox(textBox);
    this.doOverflowManagement(textBox);
    return textBox;
  }

  /** @param {IBox} box*/
  doOverflowManagement(box) {
    if (!Document.debug) assertBoxIsInsideParent(box);
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (overflows.isEmpty()) return;
    console.error("Overflow detecded", overflows.toString());
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {DetachedTextBox} textBox
   */
  attachTextBox(x, y, textBox) {
    return this.setText(x, y, textBox.text, textBox.style);
  }
}
