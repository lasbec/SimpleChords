import { Length } from "../../Shared/Length.js";
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { HLineImpl } from "./HLineImpl.js";
import { VLineImpl } from "./VLineImpl.js";
/**
 */

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").IntervalRestrictions} IntervalRestrictons
 * @typedef {import("../Geometry.js").Bounds} Bounds
 */

/**
 * @typedef {"min" | "max"} MinMax
 */

export class BoundsImpl {
  /**
   * @param {{vertical:Restrictions1D, horizontal: Restrictions1D}} args
   * @private
   */
  constructor({ vertical, horizontal }) {
    this.verticalBounds = vertical;
    this.horizontalBounds = horizontal;
  }

  static unbound() {
    return BoundsImpl.from({});
  }

  /**
   * @param {Rectangle} rect
   */
  static exactBoundsFrom(rect) {
    return BoundsImpl.from({
      maxRight: rect.getBorderVertical("right"),
      minRight: rect.getBorderVertical("right"),
      maxLeft: rect.getBorderVertical("left"),
      minLeft: rect.getBorderVertical("left"),
      maxTop: rect.getBorderHorizontal("top"),
      minTop: rect.getBorderHorizontal("top"),
      maxBottom: rect.getBorderHorizontal("bottom"),
      minBottom: rect.getBorderHorizontal("bottom"),
    });
  }

  /**
   * @param {Rectangle} rect
   */
  static minBoundsFrom(rect) {
    return BoundsImpl.from({
      minRight: rect.getBorderVertical("right"),
      minLeft: rect.getBorderVertical("left"),
      minTop: rect.getBorderHorizontal("top"),
      minBottom: rect.getBorderHorizontal("bottom"),
    });
  }

  /**
   * @param {Rectangle} rect
   */
  static maxBoundsFrom(rect) {
    return BoundsImpl.from({
      minRight: rect.getBorderVertical("right"),
      minLeft: rect.getBorderVertical("left"),
      minTop: rect.getBorderHorizontal("top"),
      minBottom: rect.getBorderHorizontal("bottom"),
    });
  }

  /**
   * @param {Bounds} restrictions
   */
  static from(restrictions) {
    return new BoundsImpl({
      horizontal: new Restrictions1D({
        maxValue: restrictions.maxWidth,
        minValue: restrictions.minWidth,
        maxUpper: restrictions.maxRight?.y,
        minUpper: restrictions.minRight?.y,
        maxLower: restrictions.maxLeft?.y,
        minLower: restrictions.minLeft?.y,
      }),
      vertical: new Restrictions1D({
        maxValue: restrictions.maxHeight,
        minValue: restrictions.minHeight,
        maxUpper: restrictions.maxTop?.x,
        minUpper: restrictions.minTop?.x,
        maxLower: restrictions.maxBottom?.x,
        minLower: restrictions.minBottom?.x,
      }),
    });
  }

  /**
   * @param {RelativeMovement} move
   */
  move(move) {
    this.verticalBounds.add(move.x);
    this.horizontalBounds.add(move.y);
  }

  /** @param {*} minMax  */
  top(minMax) {
    const value = this.verticalBounds.upper(minMax);
    if (!value) return;
    return new HLineImpl(value);
  }
  /** @param {*} minMax  */
  bottom(minMax) {
    const value = this.verticalBounds.lower(minMax);
    if (!value) return;
    return new HLineImpl(value);
  }
  /** @param {*} minMax  */
  height(minMax) {
    return this.verticalBounds.value(minMax);
  }

  /** @param {*} minMax  */
  left(minMax) {
    const value = this.horizontalBounds.lower(minMax);
    if (!value) return;
    return new VLineImpl(value);
  }

  /** @param {*} minMax  */
  right(minMax) {
    const value = this.horizontalBounds.upper(minMax);
    if (!value) return;
    return new VLineImpl(value);
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
