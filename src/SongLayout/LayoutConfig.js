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


/**
 * @param {string} str
 * @returns {LayoutConfigDto}
 */
export function parseLayoutConfigDto(str) {
  /** @type {unknown} */
  const rawStyle = JSON.parse(str);
  assertRecord(rawStyle);

  return {
    lyricTextConfig: tryReadTextConfigDto(rawStyle, "lyricTextConfig"),
    chorusTextConfig: tryReadTextConfigDto(rawStyle, "chorusTextConfig"),
    refTextConfig: tryReadTextConfigDto(rawStyle, "refTextConfig"),
    titleTextConfig: tryReadTextConfigDto(rawStyle, "titleTextConfig"),
    chordTextConfig: tryReadTextConfigDto(rawStyle, "chordTextConfig"),
    unifyChords: tryReadBool(rawStyle, "unifyChords"),

    printPageNumbers: tryReadBool(rawStyle, "printPageNumbers"),
    firstPage: tryReadLeftOrRight(rawStyle, "firstPage"),
    tableOfContents: tryReadString(rawStyle, "tableOfContents"),

    innerMargin: tryReadLengthDto(rawStyle, "innerMargin"),
    outerMargin: tryReadLengthDto(rawStyle, "outerMargin"),
    topMargin: tryReadLengthDto(rawStyle, "topMargin"),
    bottomMargin: tryReadLengthDto(rawStyle, "bottomMargin"),
    pageWidth: tryReadLengthDto(rawStyle, "pageWidth"),
    pageHeight: tryReadLengthDto(rawStyle, "pageHeight"),
    sectionDistance: tryReadLengthDto(rawStyle, "sectionDistance"),
  };
}
/**
 *
 * @param {Record<string, unknown>} obj
 * @param {string} attr
 * @returns {LengthDto}
 */

function tryReadLengthDto(obj, attr) {
  const result = tryReadString(obj, attr);
  return Length.fromString(result).toString();
}
/**
 * @param {Record<string, unknown>} obj
 * @param {string} attr
 * @returns {string}
 */

function tryReadString(obj, attr) {
  const result = obj[attr];
  if (typeof result !== "string")
    throw Error(`Unexpected type '${typeof result}' of '${attr}'`);
  return result;
}
/**
 * @param {Record<string, unknown>} obj
 * @param {string} attr
 * @returns {boolean}
 */
function tryReadBool(obj, attr) {
  const result = obj[attr];
  if (typeof result !== "boolean")
    throw Error(`Unexpected type '${typeof result}' of '${attr}'`);
  return result;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} attr
 * @returns {"left" | "right" | undefined}
 */

function tryReadLeftOrRight(obj, attr) {
  const result = obj[attr];
  if (result !== "left" && result !== "right" && result !== undefined)
    throw Error(`Unexpected '${typeof result}' of '${attr}'`);
  return result;
}
/**
 *
 * @param {Record<string, unknown>} obj
 * @param {string} attr
 * @returns {TextConfigDto}
 */

function tryReadTextConfigDto(obj, attr) {
  const result = obj[attr];
  assertRecord(result);
  return {
    font: tryReadString(result, "font"),
    fontSize: tryReadLengthDto(result, "fontSize"),
  };
}
/**
 * @param {unknown} obj
 * @returns {asserts obj is Record<string, unknown>}
 */
function assertRecord(obj) {
  if (typeof obj !== "object")
    throw Error(`Expected a record but got ${typeof obj}.`);
  if (obj === null) throw Error(`Expected a record but got null.`);
}
