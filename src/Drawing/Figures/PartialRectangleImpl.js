/**
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").PartialRectangle} PartialRectangle
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 */

/**
 * @typedef {object} BorderArgs
 * @property {VLineImpl | undefined} left
 * @property {VLineImpl | undefined} right
 * @property {HLineImpl | undefined} top
 * @property {HLineImpl | undefined} bottom
 */
import { BoundsImpl } from "./BoundsImpl.js";
import { HLineImpl } from "./HLineImpl.js";
import { PointImpl } from "./PointImpl.js";
import { RectangleImpl } from "./RectangleImpl.js";
import { VLineImpl } from "./VLineImpl.js";

/** @implements {PartialRectangle} */
export class PartialRectangleImpl {
  /**
   * @param {BoundsImpl} bounds
   * @param {import("./BoundsImpl.js").MinMax} minMax
   */
  static fromBound(bounds, minMax) {
    const left = bounds.left(minMax);
    const right = bounds.right(minMax);
    const top = bounds.top(minMax);
    const bottom = bounds.bottom(minMax);
    if (!left && !right && !top && !bottom) {
      const width = bounds.width("min");
      const [left, right] = width
        ? [VLineImpl.yAxis(), VLineImpl.yAxis().moveRight(width)]
        : [undefined, undefined];

      const height = bounds.height("min");
      const [bottom, top] = height
        ? [HLineImpl.xAxis(), HLineImpl.xAxis().moveUp(height)]
        : [undefined, undefined];
      return new PartialRectangleImpl({
        left,
        right,
        top,
        bottom,
      });
    }
    return new PartialRectangleImpl({
      left,
      right,
      top,
      bottom,
    });
  }

  /** @param {BorderArgs} args */
  static fromBorders({ left, right, top, bottom }) {
    return new PartialRectangleImpl({ left, right, top, bottom });
  }

  /**
   *@private
   * @param {BorderArgs} def
   */
  constructor(def) {
    /** @private */
    this.def = def;
  }

  get width() {
    if (this.def.left) {
      return this.def.right?.distance(this.def.left);
    }
  }

  get height() {
    if (this.def.bottom) {
      return this.def.top?.distance(this.def.bottom);
    }
  }

  toFullRectangle() {
    const { left, right, top, bottom } = this.def;

    return RectangleImpl.fromBorders({
      left: left || right || VLineImpl.yAxis(),
      right: right || left || VLineImpl.yAxis(),
      top: top || bottom || HLineImpl.xAxis(),
      bottom: bottom || top || HLineImpl.xAxis(),
    });
  }

  clone() {
    return new PartialRectangleImpl({
      left: this.def.left?.clone(),
      right: this.def.right?.clone(),
      top: this.def.top?.clone(),
      bottom: this.def.bottom?.clone(),
    });
  }

  /** @param {import("../Geometry.js").BorderPosition} position  */
  getBorder(position) {
    return this.def[position];
  }

  /** @param {"left" | "right"} position  */
  getBorderVertical(position) {
    return this.def[position];
  }
  /** @param {"bottom" | "top"} position  */
  getBorderHorizontal(position) {
    return this.def[position];
  }
}
