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
import { BoundsIml } from "./Bounds.js";
import { HLineImpl } from "./HLineImpl.js";
import { VLineImpl } from "./VLineImpl.js";

/** @implements {PartialRectangle} */
export class PartialRectangleImpl {
  /**
   * @param {BoundsIml} bounds
   */
  static fromMaxBound(bounds) {
    return new PartialRectangleImpl({
      left: bounds.left("max"),
      right: bounds.right("max"),
      top: bounds.top("max"),
      bottom: bounds.bottom("max"),
    });
  }

  /**
   * @param {BoundsIml} bounds
   */
  static fromMinBound(bounds) {
    return new PartialRectangleImpl({
      left: bounds.left("min"),
      right: bounds.right("min"),
      top: bounds.top("min"),
      bottom: bounds.bottom("min"),
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
