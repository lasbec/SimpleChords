import * as fs from "fs/promises";
import { parseSongAST } from "./SongParser.js";
import { PDFDocument } from "pdf-lib";
import { SongPrinter } from "./SongPrinter.js";
import { StandardFonts } from "pdf-lib";

const [nodePath, scriptPath, inputPath] = process.argv;

async function main() {
  console.log("Directory", await fs.readdir("./"));
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

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage();

  const printer = new SongPrinter(ast, timesRomanFont);
  printer.printToPage(page);

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(pdfOutputPath, pdfBytes);
  console.log("Pdf Result written to", pdfOutputPath);
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
