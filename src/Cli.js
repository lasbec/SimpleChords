#! /usr/bin/env node
import { main } from "./Index.js";
const [nodePath, scriptPath, inputPath, _outPath] = process.argv;

main({
  inputPath,
  outPath: _outPath === "--debug" ? undefined : _outPath,
  debug: process.argv.includes("--debug"),
}).catch((error) => {
  console.error("Main method failed with", error);
});
