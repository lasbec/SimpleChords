#! /usr/bin/env node
import * as path from "path";
import { updateVersionNumberPackageJson } from "./update-version-number.js";
import {
  assertRepositoryIsReleaseReady,
  pushReleaseCommit,
} from "./git-for-release.js";
import { execShellCmd, execShellCmdRequireSuccess } from "./exec-shell.js";
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
  console.log(`Updated package.json 'versio' to ${newVersion}`);
  const commitMsg = `release ${releaseType} ${newVersion}`;
  await pushReleaseCommit(commitMsg);
  console.log("Pushed release commit.");
  await execShellCmdRequireSuccess("npm release");
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
