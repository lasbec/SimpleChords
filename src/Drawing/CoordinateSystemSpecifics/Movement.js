import { Length } from "../../Shared/Length.js";

/**
 * @typedef {import("../Geometry.js").Point} Point
 */

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
   * @param {Point} point
   * @returns {void}
   */
  change(point) {
    point.x = point.x.add(this.x);
    point.y = point.y.add(this.y);
  }
}
