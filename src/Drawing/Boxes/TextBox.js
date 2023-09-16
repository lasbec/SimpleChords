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
 */

/**
 * @implements {IBox}
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
  /** @type {Point} */
  leftBottomCorner;
  /** @type {IBox} */
  parent;

  /**
   * @param {Point} leftBottomCorner
   * @param {string} text
   * @param {TextConfig} style
   * @param {IBox} parent
   */
  constructor(leftBottomCorner, text, style, parent) {
    this.text = text;
    this.style = style;
    this.width = LEN(
      style.font.widthOfTextAtSize(text, style.fontSize.in("pt")),
      "pt"
    );
    this.height = LEN(style.font.heightAtSize(style.fontSize.in("pt")), "pt");
    this.leftBottomCorner = leftBottomCorner;
    this.parent = parent;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {PageBox}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage*/
  drawToPdfPage(pdfPage) {
    this._drawToPdfPage(pdfPage, this.leftBottomCorner);
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
