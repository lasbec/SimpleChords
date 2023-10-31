import { Length } from "../../Shared/Length.js";
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { PointCompare } from "../CoordinateSystemSpecifics/Compare.js";
/**
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../CoordinateSystemSpecifics/Figures.js").HLine} HLine
 * @typedef {import("../CoordinateSystemSpecifics/Figures.js").VLine} VLine
 */

/**
 * @implements {HLine}
 */
export class HLineImpl {
  /**
   * @param {Length} y
   */
  constructor(y) {
    this.y = y;
    /** @type {undefined} */
    this.x;
  }

  static xAxis() {
    return new HLineImpl(Length.zero);
  }

  /** @param {Point} point  */
  static fromPoint(point) {
    return new HLineImpl(point.y);
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
    return new HLineImpl(this.y);
  }

  /** @param {Length} offset  */
  pointerUp(offset) {
    return this.clone().moveUp(offset);
  }

  /** @param {Length} offset  */
  pointerDown(offset) {
    return this.clone().moveDown(offset);
  }

  /** @param {HLineImpl | Point} other  */
  isLowerOrEq(other) {
    return PointCompare.isLowerOrEq(this, other);
  }

  /** @param {HLineImpl | Point} other  */
  isHigherOrEq(other) {
    return PointCompare.isHigherOrEq(this, other);
  }
}