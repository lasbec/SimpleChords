/**
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").Point} Point

 * @typedef {import("./Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").RectanglePlacement} RectanglePlacement
 */

/**
 * @typedef {object} BoxBorders
 * @property {Length} left
 * @property {Length} right
 * @property {Length} top
 * @property {Length} bottom
 */

import { Length } from "../Length.js";
import { getPoint } from "./BoxMeasuringUtils.js";
import { MutableFreePointer } from "./FreePointer.js";

/** @implements {MutRectangle} */
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
    return FreeBox.fromBorders({ left, right, top, bottom });
  }

  /**
   *
   * @param {RectanglePlacement} placement
   * @param {Dimensions} dims
   * @returns {FreeBox}
   */
  static fromPlacement(placement, dims) {
    const { x: left, y: bottom } = getPoint({
      targetX: "left",
      targetY: "bottom",
      corner: placement,
      ...dims,
    });
    const { x: right, y: top } = getPoint({
      targetX: "right",
      targetY: "top",
      corner: placement,
      ...dims,
    });
    return new FreeBox({
      left,
      bottom,
      right,
      top,
    });
  }

  /** @param {RectanglePlacement} placement  */
  setPosition(placement) {
    const { x: left, y: bottom } = getPoint({
      targetX: "left",
      targetY: "bottom",
      corner: placement,
      width: this.width,
      height: this.height,
    });
    const { x: right, y: top } = getPoint({
      targetX: "right",
      targetY: "top",
      corner: placement,
      width: this.width,
      height: this.height,
    });
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
  }

  /** @param {BoxBorders} args */
  static fromBorders({ left, right, top, bottom }) {
    return new FreeBox({ left, right, top, bottom });
  }

  /**
   *@private
   * @param {BoxBorders} args
   */
  constructor({ left, right, top, bottom }) {
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

  /**
   * @param {import("./Geometry.js").PointOnRect} point
   */
  getPointAt(point) {
    return new MutableFreePointer(
      this.xPositionFor(point.x),
      this.yPositionFor(point.y)
    );
  }

  /** @param {import("./Geometry.js").BorderPosition} position  */
  getBorder(position) {
    if (position === "left" || position === "right") {
      return this.xPositionFor(position);
    }
    return this.yPositionFor(position);
  }

  /** @returns {import("./Geometry.js").RectanglePlacement} */
  getAnyPosition() {
    return {
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: this.getPoint("left", "top"),
    };
  }
}
