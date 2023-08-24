import * as fs from "fs/promises";
import { parseSongAST } from "./ChordsParser.js";

let [nodePath, scriptPath, inputPath, outputPath] = process.argv;

async function main() {
  //   console.log("be", await fs.readdir("./"));
  const contentToParse = await fs.readFile(inputPath, "utf8");
  const ast = parseSongAST(contentToParse);
  if (!outputPath) {
    const pointSplit = inputPath.split(".");
    outputPath = pointSplit
      .map((e, i) => (i === pointSplit.length - 1 ? "json" : e))
      .join(".");
  }
  fs.writeFile(outputPath, JSON.stringify(ast, null, 2));
  console.log("Result written to", outputPath);
}

main().catch((error) => {
  console.error("Main method failed with", error);
});
