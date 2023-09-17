import { PDFFont } from "pdf-lib";
import { Length, LEN } from "../Length.js";

/**
 * @typedef {object }TextConfigArgs
 * @property {Length} fontSize
 * @property {PDFFont} font
 */

export class TextConfig {
  /** @type {Length} */
  fontSize;
  /** @type {PDFFont} */
  font;

  /**
   * @param {TextConfigArgs} args
   */
  constructor(args) {
    this.font = args.font;
    this.fontSize = args.fontSize;
  }

  get fontName() {
    return this.font.name;
  }

  get lineHeight() {
    const heightPt = this.font.heightAtSize(this.fontSize.in("pt"));
    return LEN(heightPt, "pt");
  }

  /**
   * @param {string} text
   */
  widthOfText(text) {
    const widthPt = this.font.widthOfTextAtSize(text, this.fontSize.in("pt"));
    return LEN(widthPt, "pt");
  }
}
