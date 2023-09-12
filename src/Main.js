import * as fs from "fs/promises";
import * as Path from "path";
import { renderAllInSingleFile, renderSingleFile } from "./RenderSongAsPdf.js";

const [nodePath, scriptPath, inputPath, _outPath] = process.argv;

/**
 *
 * @param {string} path
 */
function getCorrespondingOutPutPath(path) {
  const pointSplit = inputPath.split(".");
  return pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");
}

async function main() {
  const debug = process.argv.includes("--debug");
  const outPath = _outPath === "--debug" ? undefined : _outPath;
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
    await renderSingleFile(
      filePath,
      getCorrespondingOutPutPath(filePath),
      debug
    );
  }
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
