/**
 * @typedef {import("./Lenght.js").Lenght} Lenght
 * @typedef {import("./Page.js").IBox} IBox
 * @typedef {import("./Page.js").Dimesions}  Dimesions
 * @typedef {import("./Page.js").XStartPosition} XStartPosition
 * @typedef {import("./Page.js").YStartPosition} YStartPosition
 * @typedef {import("./Page.js").Point} Point
 * @typedef {import("./Page.js").TextStyle} TextStyle
 */
import { LEN } from "./Lenght.js";
import { Box, DetachedTextBox, TextBox } from "./Page.js";

/** @param {IBox} box */
function assertBoxIsInsideParent(box) {
  const rightBorder = box._leftBottomCorner.x.add(box.width);
  const leftBorder = box._leftBottomCorner.x;
  const topBorder = box._leftBottomCorner.y.add(box.height);
  const bottomBorder = box._leftBottomCorner.y;

  const parent = box.parent;
  const parentRightBorder = parent._leftBottomCorner.x.add(parent.width);
  const parentLeftBorder = parent._leftBottomCorner.x;
  const parentTopBorder = parent._leftBottomCorner.y.add(parent.height);
  const parentBottomBorder = parent._leftBottomCorner.y;

  const overflows = [];
  if (rightBorder.gt(parentRightBorder)) {
    overflows.push("right");
  }
  if (leftBorder.lt(parentLeftBorder)) {
    overflows.push("left");
  }
  if (topBorder.gt(parentTopBorder)) {
    overflows.push("top");
  }
  if (bottomBorder.lt(parentBottomBorder)) {
    overflows.push("bottom");
  }
  if (overflows.length > 0) {
    throw new Error(`BoxOverflow at ` + overflows.join(", "));
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

  debug = false;
  /** @param {unknown[]} args  */
  log(...args) {
    if (this.debug) {
      console.log(...args);
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
    const { x } = box._leftBottomCorner;
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
    const { y } = box._leftBottomCorner;
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
        xa: result._leftBottomCorner.x.in("mm"),
        xb: result._leftBottomCorner.y.in("mm"),
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
    assertBoxIsInsideParent(box);
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
