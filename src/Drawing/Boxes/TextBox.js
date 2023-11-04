import { PrimitiveBox } from "./PrimitiveBox.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";
/**
 */

/**
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

/**
 * @implements {LeaveBox}
 * @extends {PrimitiveBox<string, TextConfig>}
 */
export class TextBox extends PrimitiveBox {
  /**
   * @param {string} text
   * @param {TextConfig} style
   * @param {ReferencePoint=} position
   */
  constructor(text, style, position) {
    super(text, style, BoundsImpl.unbound());
    this.position = position || {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: PointImpl.origin(),
    };
  }

  /**
   * @returns {false}
   */
  hasOverflow() {
    return false;
  }

  referencePoint() {
    return this.position;
  }
  dims() {
    return {
      width: this.style.widthOfText(this.content),
      height: this.style.lineHeight,
    };
  }

  /** @param {ReferencePoint} position*/
  setPosition(position) {
    this.position = position;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const leftBottomCorner = this.rectangle.getPoint("left", "bottom");
    if (!leftBottomCorner) {
      throw Error("Position not set.");
    }
    pdfPage.drawText(this.content, {
      x: leftBottomCorner.x.in("pt"),
      y: leftBottomCorner.y.in("pt"),
      font: this.style.font,
      size: this.style.fontSize.in("pt"),
    });
  }

  partialWidths() {
    const result = [];
    let partial = "";
    for (const char of this.content) {
      const width = this.style.widthOfText(partial);
      result.push(width);
      partial += char;
    }
    return result;
  }
}
