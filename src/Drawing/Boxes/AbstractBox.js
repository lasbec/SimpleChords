import { FreeBox } from "../FreeBox.js";
import { RectangleBounds } from "./Bounds.js";

/**
 * @typedef {import("../Geometry.js").RectangleRestrictions} RectangleRestrictions
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
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
   * @param {RectangleRestrictions} bounds
   */
  constructor(content, style, bounds) {
    this.content = content;
    this.style = style;
    this.bounds = RectangleBounds.from(bounds);
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
}
