/**
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").Rectangle} Rectangle
 */

import { Length } from "../Length.js";
import { MutableFreePointer } from "./FreePointer.js";

/** @implements {Rectangle} */
export class FreeBox {
  /**
   * @param {MutableFreePointer} c0
   * @param {MutableFreePointer} c1
   */
  static fromCorners(c0, c1) {
    const left = c0.isLeftFrom(c1) ? c0.x : c1.x;
    const right = c0.isLeftFrom(c1) ? c1.x : c0.x;
    const top = c0.isLowerThan(c1) ? c1.y : c0.y;
    const bottom = c0.isLowerThan(c1) ? c0.y : c1.y;
    return new FreeBox(left, right, top, bottom);
  }

  /**
   *
   * @param {Length} left
   * @param {Length} right
   * @param {Length} top
   * @param {Length} bottom
   */
  constructor(left, right, top, bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.width = this.right.sub(this.left);
    this.height = this.top.sub(this.bottom);
  }

  xCenter() {
    return this.left.add(this.width.mul(1 / 2));
  }

  yCenter() {
    return this.bottom.add(this.height.mul(1 / 2));
  }

  /**
   * @param {XStartPosition} x
   */
  xPositionFor(x) {
    if (x === "left") {
      return this.left;
    }
    if (x === "right") {
      return this.right;
    }
    if (x === "center") {
      return this.xCenter();
    }
    throw Error(`Invalid XStartPosition ${x}`);
  }
  /**
   * @param {YStartPosition} y
   */
  yPositionFor(y) {
    if (y === "top") {
      return this.top;
    }
    if (y === "bottom") {
      return this.bottom;
    }
    if (y === "center") {
      return this.yCenter();
    }
    throw Error(`Invalid YStartPosition ${y}`);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getPoint(x, y) {
    return new MutableFreePointer(this.xPositionFor(x), this.yPositionFor(y));
  }

  /** @param {import("./Geometry.js").BorderPosition} position  */
  getBorder(position) {
    if (position === "left" || position === "right") {
      return this.xPositionFor(position);
    }
    return this.yPositionFor(position);
  }

  /** @returns {import("./Geometry.js").BoxPlacement} */
  getAnyPosition() {
    return {
      x: "left",
      y: "top",
      point: this.getPoint("left", "top"),
    };
  }
}
