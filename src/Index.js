import * as fs from "fs/promises";
import * as Path from "path";
import {
  renderAllInSingleFile,
  renderSingleFile,
} from "./SongLayout/RenderSongAsPdf.js";
import {
  DefaultLayoutConfigDto,
  parseLayoutConfigDto,
} from "./SongLayout/LayoutConfig.js";
/**
 * @typedef {import("./SongLayout/LayoutConfig.js").LayoutConfigDto} LayoutConfigDto
 * @typedef {import("./SongLayout/LayoutConfig.js").LayoutConfig} LayoutConfig
 * @typedef {import("./Drawing/TextConfig.js").TextConfigArgs} TextConfigArgs
 * @typedef {import("./Drawing/TextConfig.js").TextConfigDto} TextConfigDto
 */

export {
  DefaultLayoutConfigDto,
  parseLayoutConfigDto,
} from "./SongLayout/LayoutConfig.js";
export * from "./Shared/Length.js";

/** @param {string} inputPath */
function getCorrespondingOutPutPath(inputPath) {
  const pointSplit = inputPath.split(".");
  return pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");
}

/**
 * @typedef {object} MainArgs
 * @property {string | string[]} inputPath
 * @property {string | undefined} outPath
 * @property {boolean} debug
 * @property {LayoutConfigDto=} style
 */

/**
 * @typedef {object} MainPathArgs
 * @property {string | string[]} inputPath
 * @property {string | undefined} outPath
 * @property {boolean} debug
 * @property {string=} stylePath
 */

/**
 * @param {string | string[]} inp
 * @return {Promise<string[]>}
 */
async function resolvePaths(inp) {
  const inputArr = Array.isArray(inp) ? inp : [inp];

  const result = [];
  for (const path of inputArr) {
    if (path.endsWith(".chords.md")) {
      result.push(path);
    } else {
      const filesInDir = (await fs.readdir(path))
        .filter((f) => f.endsWith(".chords.md"))
        .map((f) => Path.join(path, f));
      result.push(...filesInDir);
    }
  }
  return result;
}

/**
 * @param {MainPathArgs} args
 */
export async function printPdfFilesFromPaths(args) {
  const stylePath = args.stylePath;
  if (!stylePath) return printPdfFiles(args);
  const content = await fs.readFile(stylePath, "utf-8");
  const style = parseLayoutConfigDto(content);
  return printPdfFiles({ ...args, style });
}

/**
 * @param {MainArgs} args
 */
export async function printPdfFiles({
  inputPath,
  outPath,
  debug,
  style: theme,
}) {
  const chordFiles = await resolvePaths(inputPath);

  if (outPath) {
    await renderAllInSingleFile(
      chordFiles,
      outPath,
      theme || DefaultLayoutConfigDto,
      debug
    );
    return;
  }
  for (const filePath of chordFiles) {
    try {
      await renderSingleFile(
        filePath,
        getCorrespondingOutPutPath(filePath),
        theme || DefaultLayoutConfigDto,
        debug
      );
    } catch (e) {
      console.error(`Faild to print ${filePath} with error`, e);
    }
  }
}
