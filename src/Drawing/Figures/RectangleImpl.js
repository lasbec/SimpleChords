/**
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 */

/**
 * @typedef {object} BoxBorders
 * @property {Length} left
 * @property {Length} right
 * @property {Length} top
 * @property {Length} bottom
 */

import { Length } from "../../Shared/Length.js";
import { getPoint } from "./FigureUtils.js";
import { HLineImpl } from "./HLineImpl.js";
import { PointImpl } from "./PointImpl.js";
import { VLineImpl } from "./VLineImpl.js";

/**
 * @typedef {import("../Geometry.js").RectangleBorders} RectangleBorders
 */

/** @implements {MutRectangle} */
export class RectangleImpl {
  /**
   * @param {PointImpl} c0
   * @param {PointImpl} c1
   */
  static fromCorners(c0, c1) {
    const left = c0.isLeftOrEq(c1) ? c0.x : c1.x;
    const right = c0.isLeftOrEq(c1) ? c1.x : c0.x;
    const top = c0.isLowerOrEq(c1) ? c1.y : c0.y;
    const bottom = c0.isLowerOrEq(c1) ? c0.y : c1.y;
    return new RectangleImpl({ left, right, top, bottom });
  }

  /** @param {RectangleBorders} borders */
  static fromBorders(borders) {
    return new RectangleImpl({
      left: borders.left.x,
      right: borders.right.x,
      top: borders.top.y,
      bottom: borders.bottom.y,
    });
  }

  /**
   *
   * @param {ReferencePoint} placement
   * @param {Dimensions} dims
   * @returns {RectangleImpl}
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
    return new RectangleImpl({
      left,
      bottom,
      right,
      top,
    });
  }

  /** @param {ReferencePoint} placement  */
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

  clone() {
    return new RectangleImpl({
      left: this.left,
      right: this.right,
      top: this.top,
      bottom: this.bottom,
    });
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
    return new PointImpl(this.xPositionFor(x), this.yPositionFor(y));
  }

  /**
   * @param {import("../Geometry.js").PointOnRect} point
   */
  getPointAt(point) {
    return new PointImpl(
      this.xPositionFor(point.x),
      this.yPositionFor(point.y)
    );
  }

  /** @param {import("../Geometry.js").BorderPosition} position  */
  getBorder(position) {
    if (position === "left" || position === "right") {
      return new VLineImpl(this.xPositionFor(position));
    }
    return new HLineImpl(this.yPositionFor(position));
  }

  /** @param {"left" | "right"} position  */
  getBorderVertical(position) {
    return new VLineImpl(this.xPositionFor(position));
  }
  /** @param {"bottom" | "top"} position  */
  getBorderHorizontal(position) {
    return new HLineImpl(this.yPositionFor(position));
  }

  /** @returns {import("../Geometry.js").ReferencePoint} */
  referencePoint() {
    return {
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: this.getPoint("left", "top"),
    };
  }
}
