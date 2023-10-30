import { AbstractBox } from "./AbstractBox.js";

/**
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 * @template Content
 * @template Style
 * @implements {LeaveBox}
 * @extends {AbstractBox<Content, Style>}
 */
export class PrimitiveBox extends AbstractBox {
  /**
   * @type {"leave"}
   * @readonly
   */
  __discriminator__ = "leave";
}
