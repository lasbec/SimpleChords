import { LEN, Length } from "../../Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { PageBox } from "./PageBox.js";
/**
 * @typedef {import("../Types.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").IBox} IBox
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 */

/**
 * @implements {DetachedBox}
 */
export class TextBox {
  /**@type {string}*/
  text;
  /**@type {TextConfig}*/
  style;
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /**
   * @param {string} text
   * @param {TextConfig} style
   */
  constructor(text, style) {
    this.text = text;
    this.style = style;
    this.width = LEN(
      style.font.widthOfTextAtSize(text, style.fontSize.in("pt")),
      "pt"
    );
    this.height = LEN(style.font.heightAtSize(style.fontSize.in("pt")), "pt");
  }

  /**
   * @param {PDFPage} pdfPage
   * @param {Point} leftBottomCorner
   */
  _drawToPdfPage(pdfPage, leftBottomCorner) {
    pdfPage.drawText(this.text, {
      x: leftBottomCorner.x.in("pt"),
      y: leftBottomCorner.y.in("pt"),
      font: this.style.font,
      size: this.style.fontSize.in("pt"),
    });
  }
}
