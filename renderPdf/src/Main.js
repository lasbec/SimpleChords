import * as fs from "fs/promises";
import * as Path from "path";
import { renderSingleFile } from "./RenderSongAsPdf.js";

const [nodePath, scriptPath, inputPath, logAstArg] = process.argv;

async function main() {
  const logAst = !!logAstArg;
  if (inputPath.endsWith(".chords.md")) {
    const pdfOutputPath = await renderSingleFile(inputPath, logAst);
  } else {
    for (const file of await fs.readdir(inputPath)) {
      if (file.endsWith(".chords.md")) {
        await renderSingleFile(Path.join(inputPath, file), logAst);
      }
    }
  }
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
