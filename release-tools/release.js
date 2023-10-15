#! /usr/bin/env node

import {
  assertRepositoryIsReleaseReady,
  pushReleaseCommit,
} from "./git-for-release.js";
import { execShellCmd, execShellCmdRequireSuccess } from "./exec-shell.js";
/**
 * @typedef {"patch" | "minor" | "major"} ReleaseType
 */

async function main() {
  const { releaseType } = collectArguments();
  await assertRepositoryIsReleaseReady();
  await execShellCmdRequireSuccess("npm run type-check");
  await execShellCmdRequireSuccess("npm run test");

  await execShellCmdRequireSuccess(
    `npm version ${releaseType} -m "release ${releaseType} %s"`
  );
  console.log("Updated package.json and commited release.");
  await pushReleaseCommit();
  console.log("Pushed release.");
  await execShellCmd("npm publish");
  console.log("Successfuly releasd package");
}

function collectArguments() {
  const [nodePath, scriptPath, releaseType] = process.argv;
  if (
    releaseType !== "patch" &&
    releaseType !== "minor" &&
    releaseType !== "major"
  ) {
    throw Error(`Invalid release type '${releaseType}'.`);
  }
  /**@type {ReleaseType} */
  const helpTheTypeChecker = releaseType;
  return { releaseType: helpTheTypeChecker, thisDir: scriptPath };
}

main();
