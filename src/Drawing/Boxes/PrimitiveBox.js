import { AbstractBox } from "./AbstractBox.js";

/**
 * @template Content
 * @template Style
 * @extends {AbstractBox<Content, Style>}
 */
export class PrimitiveBox extends AbstractBox {
  /**
   * @type {"leave"}
   * @readonly
   */
  __discriminator__ = "leave";
}
