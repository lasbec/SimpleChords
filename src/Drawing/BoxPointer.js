import { Length } from "../Length.js";
import { Document } from "./Document.js";
import { PlainBox } from "./Boxes/PlainBox.js";
import { FreePointer } from "./FreePointer.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
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

  /** @type {Box} */
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
   * @param {Box} page
   * @private
   */
  constructor(x, y, page) {
    this.freePointer = new FreePointer(x, y);
    this.box = page;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Box} box
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
   * @param {Box} box
   * @private
   */
  static xPositionOnPage(xRelative, box) {
    const width = box.width;
    const { x } = box.getPoint("left", "bottom");
    if (xRelative === "left") return x;
    if (xRelative === "center") return x.add(width.mul(1 / 2));
    if (xRelative === "right") return x.add(width);
    throw Error("Invalid x start position.");
  }

  /**
   * @param {YStartPosition} yRelative
   * @param {Box} box
   * @private
   */
  static yPositionOnPage(yRelative, box) {
    const height = box.height;
    const { y } = box.getPoint("left", "bottom");
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

  /** @param {import("./Geometry.js").BorderPosition} border*/
  moveToBorder(border) {
    if (border === "left" || border === "right") {
      this.freePointer.x = this.box.getBorder(border);
    } else {
      this.freePointer.y = this.box.getBorder(border);
    }
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
    if (!this.box.parent) return this;
    return new BoxPointer(this.x, this.y, this.box.parent);
  }

  /**
   * @param {BoxPointer} other
   * @returns {Box}
   */
  span(other) {
    const otherRelXPos = other.isLeftFrom(this) ? "left" : "right";
    const otherRelYPos = other.isLowerThan(this) ? "bottom" : "top";
    const width = this.x.sub(other.x).abs();
    const height = this.y.sub(other.y).abs();
    const box = new PlainBox({ width, height });
    return this.setBox(otherRelXPos, otherRelYPos, box);
  }

  /** @param {BoxPointer} other  */
  isLeftFrom(other) {
    return this.freePointer.isLeftFrom(other.freePointer);
  }

  /** @param {BoxPointer} other  */
  isLowerThan(other) {
    return this.freePointer.isLowerThan(other.freePointer);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  nextPageAt(x, y) {
    const nextPage = this.box.appendNewPage();
    return BoxPointer.atBox(x, y, nextPage);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Box} box
   */
  setBox(x, y, box) {
    const xToDraw = this.xPositionRelativeToThis(x, box.width);
    const yToDraw = this.yPositionRelativeToThis(y, box.height);
    box.setPosition({
      x: "left",
      y: "bottom",
      point: FreePointer.fromPoint({ x: xToDraw, y: yToDraw }),
    });
    box.setParent(this.box);

    box.setParent(this.box);
    this.box.appendChild(box);

    const rootPage = this.box.root;
    // box.setParent(rootPage); //!!
    /** @ts-ignore */
    rootPage.children.push(box);
    return box;
  }
}
