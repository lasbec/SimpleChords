import { Length } from "../../Shared/Length.js";
/**
 * @typedef {import("../Geometry.js").IntervalRestrictions} IntervalRestrictons
 * @typedef {import("../Geometry.js").RectangleRestrictions} RectangleRestrictions
 */

/**
 * @typedef {"min" | "max"} MinMax
 */

export class RectangleBounds {
  /**
   * @param {{vertical:Restrictions1D, horizontal: Restrictions1D}} args
   * @private
   */
  constructor({ vertical, horizontal }) {
    this.verticalBounds = vertical;
    this.horizontalBounds = horizontal;
  }
  /**
   * @param {RectangleRestrictions} restrictions
   */
  static from(restrictions) {
    return new RectangleBounds({
      horizontal: new Restrictions1D({
        maxValue: restrictions.maxWidth,
        minValue: restrictions.minWidth,
        maxUpper: restrictions.maxRight,
        minUpper: restrictions.minRight,
        maxLower: restrictions.maxLeft,
        minLower: restrictions.minLeft,
      }),
      vertical: new Restrictions1D({
        maxValue: restrictions.maxHeight,
        minValue: restrictions.minHeight,
        maxUpper: restrictions.maxTop,
        minUpper: restrictions.minTop,
        maxLower: restrictions.maxBottom,
        minLower: restrictions.minBottom,
      }),
    });
  }

  /** @param {*} minMax  */
  top(minMax) {
    return this.verticalBounds.upper(minMax);
  }
  /** @param {*} minMax  */
  bottom(minMax) {
    return this.verticalBounds.lower(minMax);
  }
  /** @param {*} minMax  */
  height(minMax) {
    return this.verticalBounds.value(minMax);
  }

  /** @param {*} minMax  */
  left(minMax) {
    return this.horizontalBounds.lower(minMax);
  }

  /** @param {*} minMax  */
  right(minMax) {
    return this.horizontalBounds.upper(minMax);
  }

  /** @param {*} minMax  */
  width(minMax) {
    return this.horizontalBounds.value(minMax);
  }
}

/**
 * Modeling restrictions an (closed) interval.
 * Value is the length of the segment.
 * Upper is the upper bound of the interval.
 * Lower is the upper bound of the interval.
 *
 */
class Restrictions1D {
  /**
   * @param {IntervalRestrictons} args
   */
  constructor(args) {
    /** @private */
    this._maxValue = args.maxValue;
    /** @private */
    this._minValue = args.minValue;
    /** @private */
    this._maxUpper = args.maxUpper;
    /** @private */
    this._minUpper = args.minUpper;
    /** @private */
    this._maxLower = args.maxLower;
    /** @private */
    this._minLower = args.minLower;
  }
  /**
   *
   * @param {Length} val
   */
  add(val) {
    return new Restrictions1D({
      maxValue: this._maxValue,
      minValue: this._minValue,
      maxUpper: this._maxUpper?.add(val),
      minUpper: this._minUpper?.add(val),
      maxLower: this._maxLower?.add(val),
      minLower: this._minLower?.add(val),
    });
  }

  /**
   * @param {MinMax} minMax
   * @returns {Length | undefined}
   */
  value(minMax) {
    return this[`${minMax}Value`]();
  }
  /**
   * @param {MinMax} minMax
   * @returns {Length | undefined}
   */
  upper(minMax) {
    return this[`${minMax}Upper`]();
  }
  /**
   * @param {MinMax} minMax
   * @returns {Length | undefined}
   */
  lower(minMax) {
    return this[`${minMax}Lower`]();
  }

  /** @private */
  maxValue() {
    if (this._maxValue) return this._maxValue;
    if (this._maxUpper && this._maxLower)
      return this._maxUpper.sub(this._maxLower);
  }
  /** @private */
  minValue() {
    if (this._minValue) return this._minValue;
    if (this._minUpper && this._minLower)
      return this._minUpper.sub(this._minLower);
  }
  /** @private */
  maxUpper() {
    if (this._maxUpper) return this._maxUpper;
    if (this._maxLower && this._maxValue) {
      return this._maxLower.add(this._maxValue);
    }
  }
  /** @private */
  minUpper() {
    if (this._minUpper) return this._minUpper;
    if (this._minLower && this._minValue) {
      return this._minLower.add(this._minValue);
    }
  }
  /** @private */
  maxLower() {
    if (this._maxLower) return this._maxLower;
    if (this._maxUpper && this._maxValue)
      return this._maxUpper.sub(this._maxValue);
  }
  /** @private */
  minLower() {
    if (this._minLower) return this._minLower;
    if (this._minUpper && this._minValue)
      return this._minUpper.sub(this._minValue);
  }
}
