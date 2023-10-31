import { Length } from "../Shared/Length.js";
import { FreeBox } from "./FreeBox.js";
import { RelativeMovement } from "./CoordinateSystemSpecifics/Movement.js";
import { PointCompare } from "./CoordinateSystemSpecifics/Compare.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./CoordinateSystemSpecifics/Figures.d.ts").HLine} HLine
 * @typedef {import("./CoordinateSystemSpecifics/Figures.d.ts").VLine} VLine
 */

/**
 * @implements {HLine}
 */
export class FreeHLine {
  /**
   * @param {Length} y
   */
  constructor(y) {
    this.y = y;
    /** @type {undefined} */
    this.x;
  }

  static xAxis() {
    return new FreeHLine(Length.zero);
  }

  /** @param {Point} point  */
  static fromPoint(point) {
    return new FreeHLine(point.y);
  }

  /** @param {Length} offset  */
  moveUp(offset) {
    RelativeMovement.up(offset).change(this);
    return this;
  }

  /** @param {Length} offset  */
  moveDown(offset) {
    RelativeMovement.down(offset).change(this);
    return this;
  }

  clone() {
    return new FreeHLine(this.y);
  }

  /** @param {Length} offset  */
  pointerUp(offset) {
    return this.clone().moveUp(offset);
  }

  /** @param {Length} offset  */
  pointerDown(offset) {
    return this.clone().moveDown(offset);
  }

  /** @param {FreeHLine | Point} other  */
  isLowerOrEq(other) {
    return PointCompare.isLowerOrEq(this, other);
  }

  /** @param {FreeHLine | Point} other  */
  isHigherOrEq(other) {
    return PointCompare.isHigherOrEq(this, other);
  }
}

/**
 * @implements {VLine}
 */
export class FreeVLine {
  /**
   *
   * @param {Length} x
   */
  constructor(x) {
    this.x = x;
    /** @type {undefined} */
    this.y;
  }

  static yAxis() {
    return new FreeVLine(Length.zero);
  }

  /** @param {Point} point  */
  static fromPoint(point) {
    return new FreeVLine(point.x);
  }

  /** @param {Length} offset  */
  moveRight(offset) {
    RelativeMovement.right(offset).change(this);
    return this;
  }

  /** @param {Length} offset  */
  moveLeft(offset) {
    RelativeMovement.left(offset).change(this);
    return this;
  }

  clone() {
    return new FreeVLine(this.x);
  }

  /** @param {Length} offset  */
  pointerRight(offset) {
    return this.clone().moveRight(offset);
  }

  /** @param {Length} offset  */
  pointerLeft(offset) {
    return this.clone().moveLeft(offset);
  }
  /** @param {FreeVLine | Point} other  */
  isLeftOrEq(other) {
    return PointCompare.isLeftOrEq(this, other);
  }

  /** @param {FreeVLine | Point} other  */
  isRightOrEq(other) {
    return PointCompare.isRightOrEq(this, other);
  }
}
