import { Length } from "../../Shared/Length.js";
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { PointCompare } from "../CoordinateSystemSpecifics/Compare.js";
/**
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../CoordinateSystemSpecifics/Figures.js").HLine} HLine
 * @typedef {import("../CoordinateSystemSpecifics/Figures.js").VLine} VLine
 */


/**
 * @implements {VLine}
 */

export class VLineFree {
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
    return new VLineFree(Length.zero);
  }

  /** @param {Point} point  */
  static fromPoint(point) {
    return new VLineFree(point.x);
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
    return new VLineFree(this.x);
  }

  /** @param {Length} offset  */
  pointerRight(offset) {
    return this.clone().moveRight(offset);
  }

  /** @param {Length} offset  */
  pointerLeft(offset) {
    return this.clone().moveLeft(offset);
  }
  /** @param {VLineFree | Point} other  */
  isLeftOrEq(other) {
    return PointCompare.isLeftOrEq(this, other);
  }

  /** @param {VLineFree | Point} other  */
  isRightOrEq(other) {
    return PointCompare.isRightOrEq(this, other);
  }
}
