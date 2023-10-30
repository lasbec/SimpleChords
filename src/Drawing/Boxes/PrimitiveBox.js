import { PDFPage } from "pdf-lib";
import { AbstractBox } from "./AbstractBox.js";
import { FreeBox } from "../FreeBox.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").RectanglePlacement} RectanglePlacement
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

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
