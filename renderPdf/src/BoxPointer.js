/**
 * @typedef {import("./Lenght.js").Lenght} Lenght
 * @typedef {import("./Page.js").IBox} IBox
 * @typedef {import("./Page.js").Dimesions}  Dimesions
 * @typedef {import("./Page.js").XStartPosition} XStartPosition
 * @typedef {import("./Page.js").YStartPosition} YStartPosition
 * @typedef {import("./Page.js").Point} Point
 * @typedef {import("./Page.js").TextStyle} TextStyle
 */
import { rgb } from "pdf-lib";
import { LEN } from "./Lenght.js";
import { Box, DetachedTextBox } from "./Page.js";

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

  debug = true;
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

  isOutsideOfBox() {
    const { x: leftBorder, y: bottomBorder } = this.box._leftBottomCorner;
    console.log("this.x.lt(leftBorder)", this.x, leftBorder);
    if (this.x.lt(leftBorder)) return true;
    console.log("this.y.lt(bottomBorder)", this.y, bottomBorder);
    if (this.y.lt(bottomBorder)) return true;

    const rightBorder = this.x.add(this.box.width);
    console.log("boxWidth", this.box.width);
    console.log("boxWidth", this.box.rootPage().width);
    console.log("this.x.gt(rightBorder)", this.x, rightBorder);
    if (this.x.gt(rightBorder)) return true;
    const topBorder = this.y.add(this.box.height);
    console.log("this.y.gt(topBorder)", this.y, topBorder);
    if (this.y.gt(topBorder)) return true;
    return false;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Dimesions} dims
   */
  drawBox(x, y, dims) {
    const xToDraw = this.xPositionRelativeToThis(x, dims.width);
    const yToDraw = this.yPositionRelativeToThis(y, dims.height);
    this.drawDebugRectangle({ x: xToDraw, y: yToDraw }, dims);
    const result = new Box({ x: xToDraw, y: yToDraw }, dims, this.box);
    result.assertIsInsideParent();
    return result;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {string} text
   * @param {TextStyle} style
   */
  drawText(x, y, text, style) {
    const { font, fontSize } = style;
    const height = LEN(font.heightAtSize(fontSize.in("pt")), "pt");
    const width = LEN(font.widthOfTextAtSize(text, fontSize.in("pt")), "pt");
    const xToDraw = this.xPositionRelativeToThis(x, width);
    const yToDraw = this.yPositionRelativeToThis(y, height);

    this.log("Draw Text at:", { x: xToDraw, y: yToDraw, text }, "\n");
    const pdfPage = this.box.rootPage().page;
    pdfPage.drawText(text, {
      x: xToDraw.in("pt"),
      y: yToDraw.in("pt"),
      font: font,
      size: fontSize.in("pt"),
    });
    return this.drawBox(x, y, { width, height });
  }
  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {DetachedTextBox} textBox
   */
  attachTextBox(x, y, textBox) {
    return this.drawText(x, y, textBox.text, textBox.style);
  }

  /**
   * @param {Point} leftBottomCorner
   * @param {Dimesions} dims
   * @private
   */
  drawDebugRectangle(leftBottomCorner, dims) {
    const pdfPage = this.box.rootPage().page;
    if (this.debug) {
      pdfPage.drawRectangle({
        x: leftBottomCorner.x.in("pt"),
        y: leftBottomCorner.y.in("pt"),
        width: dims.width.in("pt"),
        height: dims.height.in("pt"),
        borderWidth: 1,
        borderColor: rgb(0.75, 0.2, 0.2),
        borderOpacity: 0.75,
        opacity: 1,
      });
    }
  }
}
