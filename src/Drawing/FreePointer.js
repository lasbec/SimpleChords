import { Length } from "../Shared/Length.js";
import { FreeBox } from "./FreeBox.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 */

export class MutableFreePointer {
  /**
   * @type {Length}
   */
  x;
  /**
   * @type {Length}
   */
  y;

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

  /** @param {import("./Geometry.js").Point} point  */
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

  clone() {
    return new MutableFreePointer(this.x, this.y);
  }

  /** @param {Length} offset  */
  moveDown(offset) {
    this.y = this.y.sub(offset);
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
   * @param {MutableFreePointer} other
   * @returns {FreeBox}
   */
  span(other) {
    return FreeBox.fromCorners(this.clone(), other.clone());
  }

  /** @param {MutableFreePointer} other  */
  isLeftOrEq(other) {
    return this.x.le(other.x);
  }

  /** @param {MutableFreePointer} other  */
  isLowerOrEq(other) {
    return this.y.le(other.y);
  }

  /** @param {MutableFreePointer} other  */
  isRightOrEq(other) {
    return other.x.le(this.x);
  }

  /** @param {MutableFreePointer} other  */
  isHigherOrEq(other) {
    return other.y.le(this.y);
  }
}

export class Movement {
  /**
   * @param {Length} x
   * @param {Length} y
   * @private
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Point} start
   */
  static from(start) {
    return {
      /** @param {Point} target */
      to(target) {
        return new Movement(target.x.sub(start.x), target.y.sub(start.y));
      },
    };
  }

  /** @param {Length} amount  */
  static right(amount) {
    return new Movement(amount, Length.zero);
  }

  /** @param {Length} amount  */
  static left(amount) {
    return new Movement(amount.neg(), Length.zero);
  }

  /** @param {Length} amount  */
  static up(amount) {
    return new Movement(Length.zero, amount);
  }

  /** @param {Length} amount  */
  static down(amount) {
    return new Movement(Length.zero, amount.neg());
  }

  /**
   * @param {MutableFreePointer} point
   * @returns {void}
   */
  change(point) {
    point.x = point.x.add(this.x);
    point.y = point.y.add(this.y);
  }
}
