#! /usr/bin/env node
import { printPdfFilesFromPaths } from "./Index.js";
const [nodePath, scriptPath, ...args] = process.argv;

const debug = process.argv.includes("--debug");
const indexOfDebugFlag = args.indexOf("--debug");
if (indexOfDebugFlag > -1) {
  args.splice(indexOfDebugFlag, 1);
}

/** @type {string | undefined} */
let stylePath;
const indexOfStylePath = args.indexOf("--theme");
if (indexOfStylePath > -1) {
  stylePath = args.splice(indexOfStylePath, 2)[1];
  if (!stylePath) {
    throw new Error("Expected path after --theme ");
  }
}

if (args.length === 0) {
  throw new Error("First linarument must be a paths.");
}

const outPath = args.length <= 1 ? undefined : args[args.length - 1];

const inputPath = args.slice(0, -1);

printPdfFilesFromPaths({
  inputPath,
  outPath,
  debug: debug,
  stylePath,
}).catch((error) => {
  console.error("Main method failed with", error);
});
