import { LEN, Length } from "../../Length.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
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
    this.width = style.widthOfText(text);
    this.height = style.lineHeight;
  }

  /**
   * @param {PDFPage} pdfPage
   * @param {import("./Geometry.js").BoxCoordinates} coordinates
   */
  drawToPdfPage(pdfPage, coordinates) {
    const leftBottomCorner = coordinates.getCoordinates("left", "bottom");
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
