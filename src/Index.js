import * as fs from "fs/promises";
import * as Path from "path";
import { renderAllInSingleFile, renderSingleFile } from "./RenderSongAsPdf.js";

/** @param {string} inputPath */
function getCorrespondingOutPutPath(inputPath) {
  const pointSplit = inputPath.split(".");
  return pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");
}

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
      debug
    );
    return;
  }
  const chordFiles = (await fs.readdir(inputPath))
    .filter((f) => f.endsWith(".chords.md"))
    .map((f) => Path.join(inputPath, f));
  if (outPath) {
    await renderAllInSingleFile(chordFiles, outPath, debug);
    return;
  }
  for (const filePath of chordFiles) {
    try {
      await renderSingleFile(
        filePath,
        getCorrespondingOutPutPath(filePath),
        debug
      );
    } catch (e) {
      console.error(`Faild to print ${filePath} with error`, e);
    }
  }
}
