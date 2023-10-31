/**
 * @typedef {import("../Geometry.js").Point} Point
 */

export class PointCompare {
  /**
   * @param {Point} p0
   * @param {Point} p1
   */
  static isLeftOrEq(p0, p1) {
    return p0.x.le(p1.x);
  }

  /**
   * @param {Point} p0
   * @param {Point} p1
   */
  static isLowerOrEq(p0, p1) {
    return p0.y.le(p1.y);
  }

  /**
   * @param {Point} p0
   * @param {Point} p1
   */
  static isRightOrEq(p0, p1) {
    return p1.x.le(p0.x);
  }

  /**
   * @param {Point} p0
   * @param {Point} p1
   */
  static isHigherOrEq(p0, p1) {
    return p1.y.le(p0.y);
  }
}
