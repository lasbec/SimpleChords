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
    const point = box.getPoint(x, y);
    return new BoxPointer(point.x, point.y, box);
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
    this.freePointer.x = this.box.getPoint("center", "center").x;
    return this;
  }

  moveVerticalCenter() {
    this.freePointer.y = this.box.getPoint("center", "center").y;
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
    const otherRelXPos = other.isLeftFrom(this) ? "right" : "left";
    const otherRelYPos = other.isLowerThan(this) ? "top" : "bottom";
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
    box.setPosition({
      x,
      y,
      point: FreePointer.fromPoint(this),
    });
    box.setParent(this.box);

    box.setParent(this.box);
    this.box.appendChild(box);

    const rootPage = this.box.root;
    rootPage.appendChild(box);
    return box;
  }
}
