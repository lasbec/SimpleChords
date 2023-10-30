import { PDFPage } from "pdf-lib";
import { AbstractBox } from "./AbstractBox.js";

/**
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").RectanglePlacement} RectanglePlacement
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

  /**
   * @param {Content} content
   * @param {Style} style
   * @param {MutRectangle} rectangle
   */
  constructor(content, style, rectangle) {
    super(content, style);
    this.rectangle = rectangle;
  }

  /**
   * @param {RectanglePlacement} position
   */
  setPosition(position) {
    this.rectangle.setPosition(position);
  }

  /** @param {PDFPage} page  */
  drawToPdfPage(page) {
    throw Error("drawToPdfPage is not implemented.");
  }
}
