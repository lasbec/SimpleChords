import { Length } from "../Shared/Length.js";
import { FreeBox } from "./FreeBox.js";
import { RelativeMovement } from "./CoordinateSystemSpecifics/Movement.js";
import { PointCompare } from "./CoordinateSystemSpecifics/Compare.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./CoordinateSystemSpecifics/Figures.js").VLine} VLine
 * @typedef {import("./CoordinateSystemSpecifics/Figures.js").HLine} HLine
 */

export class MutableFreePointer {
  /**
   *
   * @param {Length} x
   * @param {Length} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static origin() {
    return new MutableFreePointer(Length.zero, Length.zero);
  }

  /** @param {Point} point  */
  static fromPoint(point) {
    return new MutableFreePointer(point.x, point.y);
  }

  /**
   * @param {import("../Shared/Length.js").UnitName} unit
   */
  rawPointIn(unit) {
    return {
      x: this.x.in(unit),
      y: this.y.in(unit),
    };
  }

  /**
   * @param {MutableFreePointer | Length} other
   * @return {this}
   */
  alignVerticalWith(other) {
    this.y = other instanceof Length ? other : other.y;
    return this;
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
    return new MutableFreePointer(this.x, this.y);
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
   * @param {MutableFreePointer} other
   * @returns {FreeBox}
   */
  span(other) {
    return FreeBox.fromCorners(this.clone(), other.clone());
  }

  /** @param {Point | VLine} other  */
  isLeftOrEq(other) {
    return PointCompare.isLeftOrEq(this, other);
  }

  /** @param {Point | HLine} other  */
  isLowerOrEq(other) {
    return PointCompare.isLowerOrEq(this, other);
  }

  /** @param {Point | VLine} other  */
  isRightOrEq(other) {
    return PointCompare.isRightOrEq(this, other);
  }

  /** @param {Point | HLine} other  */
  isHigherOrEq(other) {
    return PointCompare.isHigherOrEq(this, other);
  }
}
