import * as fs from "fs/promises";
import { parseSongAST } from "./SongParser.js";
import { renderSongAsPdf } from "./RenderSongAsPdf.js";
import { FontLoader } from "./FontLoader.js";

const [nodePath, scriptPath, inputPath] = process.argv;

async function main() {
  const contentToParse = await fs.readFile(inputPath, "utf8");
  const ast = parseSongAST(contentToParse);

  const pointSplit = inputPath.split(".");
  const astOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "AST.json" : e))
    .join(".");
  const pdfOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");

  fs.writeFile(astOutputPath, JSON.stringify(ast, null, 2));
  console.log("AST result written to", astOutputPath);

  const fontLoader = new FontLoader("./fonts");
  const pdfBytes = await renderSongAsPdf(ast, fontLoader);

  await fs.writeFile(pdfOutputPath, pdfBytes);
  console.log("Pdf Result written to", pdfOutputPath);
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
