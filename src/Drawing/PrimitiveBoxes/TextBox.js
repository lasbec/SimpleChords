import { LEN, Length } from "../../Length.js";
import { getPoint } from "../BoxMeasuringUtils.js";
import { BoxPointer } from "../BoxPointer.js";
import { FreePointer } from "../FreePointer.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").PrimitiveBox} PrimitiveBox
 */

/**
 * @implements {PrimitiveBox}
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
    /** @type {BoxPlacement} */
    this.position = {
      x: "left",
      y: "top",
      point: new FreePointer(Length.zero, Length.zero),
    };
  }

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.position = position;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const leftBottomCorner = getPoint({
      targetX: "left",
      targetY: "bottom",
      corner: this.position,
      width: this.width,
      height: this.height,
    });
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
