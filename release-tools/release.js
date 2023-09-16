#! /usr/bin/env node
import * as path from "path";
import { updateVersionNumberPackageJson } from "./update-version-number.js";
import {
  assertRepositoryIsReleaseReady,
  pushReleaseCommit,
} from "./git-for-release.js";
/**
 * @typedef {"patch" | "minor" | "major"} ReleaseType
 */

async function main() {
  const { releaseType, thisDir: thisScriptPath } = collectArguments();
  const packageJsonPath = path.join(thisScriptPath, "..", "..", "package.json");
  await assertRepositoryIsReleaseReady();
  const newVersion = await updateVersionNumberPackageJson(
    packageJsonPath,
    releaseType
  );
  const commitMsg = `release ${releaseType} ${newVersion}`;
  await pushReleaseCommit(commitMsg);
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
