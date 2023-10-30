import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { MutableFreePointer } from "../FreePointer.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
 */

/**
 * @implements {PrimitiveBox}
 */
export class TextBox extends AbstractPrimitiveBox {
  /**@type {string}*/
  text;
  /**@type {TextConfig}*/
  style;

  /**
   * @param {string} text
   * @param {TextConfig} style
   */
  constructor(text, style) {
    super(
      {
        width: style.widthOfText(text),
        height: style.lineHeight,
      },
      {
        pointOnRect: { x: "left", y: "bottom" },
        pointOnGrid: MutableFreePointer.origin(),
      }
    );
    this.text = text;
    this.style = style;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const leftBottomCorner = this.rectangle.getPoint("left", "bottom");
    if (!leftBottomCorner) {
      throw Error("Position not set.");
    }
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