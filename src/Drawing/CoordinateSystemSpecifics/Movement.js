import { Length } from "../../Shared/Length.js";

/**
 * @typedef {import("./Figures.d.ts").Point} Point
 * @typedef {import("./Figures.d.ts").Line} Line
 * @typedef {import("./Figures.d.ts").HLine} HLine
 * @typedef {import("./Figures.d.ts").VLine} VLine
 * @typedef {import("../Geometry.d.ts").Movement} Movement
 *
 */

/**
  @implements {Movement}
 */
export class RelativeMovement {
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
        return new RelativeMovement(
          target.x.sub(start.x),
          target.y.sub(start.y)
        );
      },
    };
  }

  /** @param {Length} amount  */
  static right(amount) {
    return new RelativeMovement(amount, Length.zero);
  }

  /** @param {Length} amount  */
  static left(amount) {
    return new RelativeMovement(amount.neg(), Length.zero);
  }

  /** @param {Length} amount  */
  static up(amount) {
    return new RelativeMovement(Length.zero, amount);
  }

  /** @param {Length} amount  */
  static down(amount) {
    return new RelativeMovement(Length.zero, amount.neg());
  }

  /**
   * @param {Line | Point} point
   * @returns {void}
   */
  change(point) {
    point.x = point.x?.add(this.x);
    point.y = point.y?.add(this.y);
  }
}

/**
 * @implements {Movement}
 */
export class AlignMovement {
  /**
   * @param {Line} line
   * @private
   * */
  constructor(line) {
    this.line = line;
  }

  /**
   * @param {VLine | Point} line
   */
  static alignHorizontalWith(line) {
    return new AlignMovement({ x: line.x, y: undefined });
  }

  /**
   * @param {HLine | Point} line
   */
  static alignVerticalWith(line) {
    return new AlignMovement({ y: line.y, x: undefined });
  }

  /**
   * @param {Point} point
   */
  change(point) {
    point.x = this.line.x || point.x;
    point.y = this.line.y || point.y;
  }
}
