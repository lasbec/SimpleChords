#! /usr/bin/env node
import { printPdfFiles } from "./Index.js";
const [nodePath, scriptPath, inputPath, _outPath] = process.argv;

printPdfFiles({
  inputPath,
  outPath: _outPath === "--debug" ? undefined : _outPath,
  debug: process.argv.includes("--debug"),
}).catch((error) => {
  console.error("Main method failed with", error);
});
