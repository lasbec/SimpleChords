import { PDFPage } from "pdf-lib";
import { FreeBox } from "../FreeBox.js";
import { Length } from "../../Shared/Length.js";

/**
 */

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 * @typedef {"" | "Min" | "Max"} MinMaxEmptyString
 * @typedef {`${"width" | "height"}${MinMaxEmptyString}`} BoundMark
 */

/**
 * @template Content
 * @template Style
 * @template {BoundMark} Bounds
 */
export class AbstractBox {
  /**
   * @param {Content} content
   * @param {Style} style
   * @param {Record<Bounds, Length>} bounds
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
    return FreeBox.fromPlacement(this.getAnyPosition(), this.dims());
  }

  getAnyPosition() {
    return this.rectangle.getAnyPosition();
  }
}
