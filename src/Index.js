import * as fs from "fs/promises";
import * as Path from "path";
import { renderAllInSingleFile, renderSingleFile } from "./RenderSongAsPdf.js";
import { StandardFonts } from "pdf-lib";

/** @param {string} inputPath */
function getCorrespondingOutPutPath(inputPath) {
  const pointSplit = inputPath.split(".");
  return pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");
}

/**
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfigDto} LayoutConfigDto
 */

/**
 * @type {LayoutConfigDto}
 */
const configDto = {
  pageHeight: "148.5mm",
  pageWidth: "210mm",

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

/**
 * @typedef {object} MainArgs
 * @property {string} inputPath
 * @property {string | undefined} outPath
 * @property {boolean} debug
 */

/**
 * @param {MainArgs} args
 */
export async function printPdfFiles({ inputPath, outPath, debug }) {
  if (inputPath.endsWith(".chords.md")) {
    await renderSingleFile(
      inputPath,
      outPath || getCorrespondingOutPutPath(inputPath),
      configDto,
      debug
    );
    return;
  }
  const chordFiles = (await fs.readdir(inputPath))
    .filter((f) => f.endsWith(".chords.md"))
    .map((f) => Path.join(inputPath, f));
  if (outPath) {
    await renderAllInSingleFile(chordFiles, outPath, configDto, debug);
    return;
  }
  for (const filePath of chordFiles) {
    try {
      await renderSingleFile(
        filePath,
        getCorrespondingOutPutPath(filePath),
        configDto,
        debug
      );
    } catch (e) {
      console.error(`Faild to print ${filePath} with error`, e);
    }
  }
}
