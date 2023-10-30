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
 * @typedef {import("../Geometry.js").PatialRectangle} PatialRectangle
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
    this._bounds = bounds;
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

  /**
   * @param {"max" | "min"} dir
   * @returns {PatialRectangle}
   */
  limitBox(dir) {
    const limitBox = FreeBox.fromPlacement(this.referencePoint(), {
      width: this._bounds[`${dir}Width`] || Length.zero,
      height: this._bounds[`${dir}Height`] || Length.zero,
    });
    const horizontalLimits = this._bounds[`${dir}Width`]
      ? {
          left: limitBox.getBorder("left"),
          right: limitBox.getBorder("right"),
        }
      : {};
    const verticalLimits = this._bounds[`${dir}Height`]
      ? {
          top: limitBox.getBorder("top"),
          bottom: limitBox.getBorder("bottom"),
        }
      : {};
    return {
      width: this._bounds[`${dir}Width`],
      height: this._bounds[`${dir}Height`],
      ...horizontalLimits,
      ...verticalLimits,
    };
  }
}
