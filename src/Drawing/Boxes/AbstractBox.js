import { FreeBox } from "../FreeBox.js";
import { Length } from "../../Shared/Length.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 * @typedef {import("../Geometry.js").Bounds} Bounds
 * @typedef {import("../Geometry.js").PartialRectangle} PartialRectangle
 */

/**
 * @template Content
 * @template Style
 */
export class AbstractBox {
  /**
   * @param {Content} content
   * @param {Style} style
   * @param {Bounds} bounds
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
    return FreeBox.fromPlacement(this.referencePoint(), this.dims());
  }

  referencePoint() {
    return this.rectangle.referencePoint();
  }

  /** @param {"min" | "max" } upperLower */
  limitRectangle(upperLower) {
    return Limits.fromBounds(this.referencePoint(), this.bounds, upperLower);
  }
}

/**
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 */

/**
 * @implements {PartialRectangle}
 */
export class Limits {
  /**
   * @param {PartialRectangle} rect
   */
  constructor(rect) {
    this.left = rect.left;
    this.right = rect.right;
    this.top = rect.top;
    this.bottom = rect.bottom;
    this.width = rect.width;
    this.height = rect.height;
  }
  /**
   * @param {ReferencePoint} referencePoint
   * @param {Bounds} bounds
   * @param {"min" | "max" } upperLower
   */
  static fromBounds(referencePoint, bounds, upperLower) {
    const limitBox = FreeBox.fromPlacement(referencePoint, {
      width: bounds[`${upperLower}Width`] || Length.zero,
      height: bounds[`${upperLower}Height`] || Length.zero,
    });
    const horizontalLimits = bounds[`${upperLower}Width`]
      ? {
          left: limitBox.getBorder("left"),
          right: limitBox.getBorder("right"),
        }
      : {};
    const verticalLimits = bounds[`${upperLower}Height`]
      ? {
          top: limitBox.getBorder("top"),
          bottom: limitBox.getBorder("bottom"),
        }
      : {};
    return {
      width: bounds[`${upperLower}Width`],
      height: bounds[`${upperLower}Height`],
      ...horizontalLimits,
      ...verticalLimits,
    };
  }
}
