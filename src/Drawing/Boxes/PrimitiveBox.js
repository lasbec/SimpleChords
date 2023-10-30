import { AbstractBox } from "./AbstractBox.js";

/**
 */

/**
 * @typedef {import("./AbstractBox.js").BoundMark} BoundMark
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").RectanglePlacement} RectanglePlacement
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 * @template Content
 * @template Style
 * @template {BoundMark} Bounds
 * @extends {AbstractBox<Content, Style, Bounds>}
 */
export class PrimitiveBox extends AbstractBox {
  /**
   * @type {"leave"}
   * @readonly
   */
  __discriminator__ = "leave";
}
