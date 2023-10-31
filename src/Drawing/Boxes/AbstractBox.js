import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";

/**
 * @typedef {import("../Geometry.js").Bounds} RectangleRestrictions
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 * @template Content
 * @template Style
 */
export class AbstractBox {
  /**
   * @param {Content} content
   * @param {Style} style
   * @param {BoundsImpl} bounds
   */
  constructor(content, style, bounds) {
    this.content = content;
    this.style = style;
    this.bounds = bounds;
    /** @type {Box | null} */
    this.parent = null;
  }

  /** @returns {Box} */
  get root() {
    if (this.parent === null) {
      /** @ts-ignore */
      return this;
    }
    return this.parent.root;
  }

  level() {
    if (this.parent === null) {
      return 0;
    }
    return 1 + this.parent.level();
  }

  /** subclasses need to implement dims and getAnyPosition or just rectangle */
  /** @returns {Dimensions} */
  dims() {
    return this.rectangle;
  }

  /**
   * @returns {Rectangle}
   */
  get rectangle() {
    return RectangleImpl.fromPlacement(this.referencePoint(), this.dims());
  }

  referencePoint() {
    return this.rectangle.referencePoint();
  }
}
