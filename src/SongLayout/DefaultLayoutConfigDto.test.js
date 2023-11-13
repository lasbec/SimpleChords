import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { DefaultLayoutConfigDto } from "./DefaultLayoutConfigDto.js";
import { StandardFonts } from "pdf-lib";

describe("DefaultLayoutConfigDto", () => {
  it("ensure stable interface", () => {
    expect(DefaultLayoutConfigDto).toEqual({
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
    });
  });
});
