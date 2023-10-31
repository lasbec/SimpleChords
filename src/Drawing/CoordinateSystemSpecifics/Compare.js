/**
 * @typedef {import("./Figures.d.ts").Point} Point
 * @typedef {import("./Figures.d.ts").VLine} VLine
 * @typedef {import("./Figures.d.ts").HLine} HLine
 */

export class PointCompare {
  /**
   * @param {VLine | Point} p0
   * @param {VLine | Point} p1
   */
  static isLeftOrEq(p0, p1) {
    return p0.x.le(p1.x);
  }

  /**
   * @param {HLine | Point} p0
   * @param {HLine | Point} p1
   */
  static isLowerOrEq(p0, p1) {
    return p0.y.le(p1.y);
  }

  /**
   * @param {VLine | Point} p0
   * @param {VLine | Point} p1
   */
  static isRightOrEq(p0, p1) {
    return p1.x.le(p0.x);
  }

  /**
   * @param {HLine | Point} p0
   * @param {HLine | Point} p1
   */
  static isHigherOrEq(p0, p1) {
    return p1.y.le(p0.y);
  }

  /**
   * @param {(VLine | undefined)[]} arr
   * @returns {VLine | undefined}
   */
  static maybeLeftMostLine(arr) {
    /** @type {VLine | undefined} */
    let result;
    for (const el of arr) {
      if (!el) return;
      if (!result) {
        result = el;
      } else if (this.isLeftOrEq(el, result)) {
        result = el;
      }
    }
    return result;
  }

  /**
   *  @param {(VLine | undefined)[]} arr
   * @returns {VLine | undefined}
   */
  static maybeRightMostLine(arr) {
    /** @type {VLine | undefined} */
    let result;
    for (const el of arr) {
      if (!el) return;
      if (!result) {
        result = el;
      } else if (this.isRightOrEq(el, result)) {
        result = el;
      }
    }
    return result;
  }

  /**
   *  @param {(HLine | undefined)[]} arr
   * @returns {HLine | undefined}
   */
  static maybeTopMostLine(arr) {
    /** @type {HLine | undefined} */
    let result;
    for (const el of arr) {
      if (!el) return;
      if (!result) {
        result = el;
      } else if (this.isHigherOrEq(el, result)) {
        result = el;
      }
    }
    return result;
  }

  /**
   *  @param {(HLine | undefined)[]} arr
   * @returns {HLine | undefined}
   */
  static maybeBottomMostLine(arr) {
    /** @type {HLine | undefined} */
    let result;
    for (const el of arr) {
      if (!el) return;
      if (!result) {
        result = el;
      } else if (this.isLowerOrEq(el, result)) {
        result = el;
      }
    }
    return result;
  }
}
