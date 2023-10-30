import { AbstractBox } from "./AbstractBox.js";

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
