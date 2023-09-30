/**
 * @typedef {import("./Geometry.js").BoxPosition} BoxPosition
 */

import { FreeBoxPosition } from "./FreeBoxPosition.js";

/**
 * @typedef {import("../Length.js").Length} Length
 */

export class FreePointer {
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

  /**
   * @param {import("../Length.js").UnitName} unit
   */
  rawPointIn(unit) {
    return {
      x: this.x.in(unit),
      y: this.y.in(unit),
    };
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
    return new FreePointer(this.x, this.y);
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
   * @param {FreePointer} other
   * @returns {BoxPosition}
   */
  span(other) {
    return FreeBoxPosition.fromCorners(this.clone(), other.clone());
  }

  /** @param {FreePointer} other  */
  isLeftFrom(other) {
    return this.x.lt(other.x);
  }

  /** @param {FreePointer} other  */
  isLowerThan(other) {
    return this.y.lt(other.y);
  }
}
