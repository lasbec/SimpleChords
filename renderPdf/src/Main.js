import * as fs from "fs/promises";
import * as Path from "path";
import { renderSingleFile } from "./RenderSongAsPdf.js";

const [nodePath, scriptPath, inputPath, debugArg] = process.argv;

async function main() {
  const debug = !!debugArg;
  if (inputPath.endsWith(".chords.md")) {
    const pdfOutputPath = await renderSingleFile(inputPath, debug);
  } else {
    for (const file of await fs.readdir(inputPath)) {
      if (file.endsWith(".chords.md")) {
        await renderSingleFile(Path.join(inputPath, file), debug);
      }
    }
  }
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
