import { StandardFonts } from "pdf-lib";

/**
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfigDto} LayoutConfigDto
 */
/**
 * @type {LayoutConfigDto}
 */
export const DefaultLayoutConfigDto = {
  pageWidth: "148.5mm",
  pageHeight: "210mm",

  leftMargin: "5mm",
  rightMargin: "5mm",
  topMargin: "5mm",
  bottomMargin: "5mm",
  sectionDistance: "12pt",

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
    font: StandardFonts.TimesRoman,
  },
  chordTextConfig: {
    font: StandardFonts.TimesRomanBoldItalic,
    fontSize: "9pt",
  },
};
