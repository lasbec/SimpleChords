import { StandardFonts } from "pdf-lib";
import { Length } from "../Index.js";

/**
 */

/**
 * @typedef {import("../Shared/Length.js").LengthDto} LengthDto
 * @typedef {import("../Drawing/TextConfig.js").TextConfigDto} TextConfigDto
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 */

/**
 * @typedef {object} LayoutConfigDto
 * @property {TextConfigDto} lyricTextConfig
 * @property {TextConfigDto} chorusTextConfig
 * @property {TextConfigDto} refTextConfig
 * @property {TextConfigDto} titleTextConfig
 * @property {TextConfigDto} chordTextConfig
 * @property {boolean=} unifyChords
 *
 * @property {boolean} printPageNumbers
 * @property {"left" | "right" =} firstPage
 * @property {string =} tableOfContents
 *
 * @property {LengthDto} outerMargin
 * @property {LengthDto} innerMargin
 * @property {LengthDto} topMargin
 * @property {LengthDto} bottomMargin
 * @property {LengthDto} pageWidth
 * @property {LengthDto} pageHeight
 * @property {LengthDto} sectionDistance
 */

/**
 * @typedef {object} LayoutConfig
 * @property {TextConfig} lyricTextConfig
 * @property {TextConfig} chorusTextConfig
 * @property {TextConfig} refTextConfig
 * @property {TextConfig} titleTextConfig
 * @property {TextConfig} chordTextConfig
 * @property {boolean} unifyChords
 *
 * @property {boolean} printPageNumbers
 * @property {"left" | "right"} firstPage
 * @property {string} tableOfContents
 *
 * @property {Length} outerMargin
 * @property {Length} innerMargin
 * @property {Length} topMargin
 * @property {Length} bottomMargin
 *
 * @property {Length} pageWidth
 * @property {Length} pageHeight
 *
 * @property {Length} sectionDistance
 */

/**
 * @type {LayoutConfigDto}
 */
export const DefaultLayoutConfigDto = {
  pageWidth: "148.5mm",
  pageHeight: "210mm",

  outerMargin: "5mm",
  innerMargin: "20mm",
  topMargin: "5mm",
  bottomMargin: "5mm",
  sectionDistance: "12pt",

  printPageNumbers: true,

  lyricTextConfig: {
    font: StandardFonts.TimesRoman,
    fontSize: "11pt",
  },
  refTextConfig: {
    font: StandardFonts.TimesRomanBold,
    fontSize: "11pt",
  },
  chorusTextConfig: {
    font: StandardFonts.TimesRomanItalic,
    fontSize: "11pt",
  },
  titleTextConfig: {
    fontSize: "13pt",
    font: StandardFonts.TimesRomanBoldItalic,
  },
  chordTextConfig: {
    font: StandardFonts.TimesRomanBoldItalic,
    fontSize: "9pt",
  },
};
