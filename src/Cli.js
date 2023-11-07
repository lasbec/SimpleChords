#! /usr/bin/env node
import { printPdfFiles } from "./Index.js";
const [nodePath, scriptPath, ...args] = process.argv;

const debug = process.argv.includes("--debug");
const indexOfDebugFlag = args.indexOf("--debug");
if (indexOfDebugFlag > -1) {
  args.splice(indexOfDebugFlag, 1);
}

if (args.length === 0) {
  throw new Error("First linarument must be a paths.");
}

const outPath = args.length <= 1 ? undefined : args[args.length - 1];

const inputPath = args.slice(0, -1);

printPdfFiles({
  inputPath,
  outPath,
  debug: debug,
}).catch((error) => {
  console.error("Main method failed with", error);
});
