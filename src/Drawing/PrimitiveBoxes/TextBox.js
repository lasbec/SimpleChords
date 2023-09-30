import { LEN, Length } from "../../Length.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Boxes/Geometry.js").Point} Point
 * @typedef {import("../Boxes/Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Boxes/Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Boxes/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Boxes/Geometry.js").DetachedBox} DetachedBox
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
    this.width = style.widthOfText(text);
    this.height = style.lineHeight;
  }

  /**
   * @param {PDFPage} pdfPage
   * @param {import("../Boxes/Geometry.js").BoxPosition} position
   */
  drawToPdfPage(pdfPage, position) {
    const leftBottomCorner = position.getPointerAt("left", "bottom");
    pdfPage.drawText(this.text, {
      x: leftBottomCorner.x.in("pt"),
      y: leftBottomCorner.y.in("pt"),
      font: this.style.font,
      size: this.style.fontSize.in("pt"),
    });
  }

  partialWidths() {
    const result = [];
    let partial = "";
    for (const char of this.text) {
      const width = this.style.widthOfText(partial);
      result.push(width);
      partial += char;
    }
    return result;
  }
}
