import { AbstractBox } from "./AbstractBox.js";

/**
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 *  @implements {LeaveBox}
 */
export class PrimitiveBox extends AbstractBox {
  /**
   * @type {"leave"}
   * @readonly
   */
  __discriminator__ = "leave";
}
