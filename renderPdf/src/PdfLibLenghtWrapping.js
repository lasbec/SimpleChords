import { layoutMultilineText as originalLayoutMultilineText } from "pdf-lib";
import { Lenght, LEN } from "./Lenght";

/**
 * @typedef {object} LayoutBounds
 * @property {Lenght} x
 * @property {Lenght} y
 * @property {Lenght} width
 * @property {Lenght} height
 */

/**
 * @typedef {object} LayoutTextOptions
 * @property {import("pdf-lib").TextAlignment} alignment
 * @property {Lenght} fontSize
 * @property  {import("pdf-lib").PDFFont} font
 * @property  {LayoutBounds} bounds
 */

/**
 * @typedef {object} TextPosition
 * @property {string} text
 * @property {import("pdf-lib").PDFHexString} encoded
 * @property {Lenght} x
 * @property {Lenght} y
 * @property {Lenght} width
 * @property {Lenght} height
 */

/**
 * @typedef {object} MultilineTextLayout
 * @property {LayoutBounds} bounds
 * @property {TextPosition[]} lines
 * @property {Lenght} fontSize
 * @property {Lenght} lineHeight
 */

/**
 *
 * @param {string} text
 * @param {LayoutTextOptions} options
 * @returns {MultilineTextLayout}
 */
export function layoutMultilineText(text, options) {
  /** @type {import("pdf-lib").LayoutTextOptions} */
  const translatedOptions = {
    ...options,
    fontSize: options.fontSize.in("pt"),
    bounds: {
      x: options.bounds.x.in("pt"),
      y: options.bounds.y.in("pt"),
      height: options.bounds.height.in("pt"),
      width: options.bounds.width.in("pt"),
    },
  };
  const result = originalLayoutMultilineText(text, translatedOptions);
  return {
    bounds: {
      x: LEN(result.bounds.x, "pt"),
      y: LEN(result.bounds.y, "pt"),
      height: LEN(result.bounds.height, "pt"),
      width: LEN(result.bounds.width, "pt"),
    },
    fontSize: LEN(result.fontSize, "pt"),
    lineHeight: LEN(result.lineHeight, "pt"),
    lines: result.lines.map((line) => ({
      ...line,
      x: LEN(line.x, "pt"),
      y: LEN(line.y, "pt"),
      width: LEN(line.width, "pt"),
      height: LEN(line.height, "pt"),
    })),
  };
}
