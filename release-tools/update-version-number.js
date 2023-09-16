#! /usr/bin/env node
import * as fs from "fs";

/**
 * @typedef {"patch" | "minor" | "major"} ReleaseType
 * @typedef {[number, number, number]} VersionNumber
 */

/**
 *
 * @param {string} packageJsonPath
 * @param {ReleaseType} releaseType
 * @returns
 */
export async function updateVersionNumberPackageJson(
  packageJsonPath,
  releaseType
) {
  const oldVersion = await getOldVersionFromFile(packageJsonPath);
  const newVersion = await nextVersion(oldVersion, releaseType);
  await replaceVersionNumberWith(packageJsonPath, newVersion);
  return newVersion.join(".");
}

/**
 * @param {VersionNumber} v
 * @param {ReleaseType} releaseType
 * @return {VersionNumber}
 **/
function nextVersion(v, releaseType) {
  if (releaseType === "patch") {
    return [v[0], v[1], v[2] + 1];
  }
  if (releaseType === "minor") {
    return [v[0], v[1] + 1, 0];
  }
  if (releaseType === "major") {
    return [v[0] + 1, 0, 0];
  }
  throw new Error(`Invalid release type '${releaseType}'`);
}

const versionRegex =
  /"version": "(?<major>[0-9]*)\.(?<minor>[0-9]*)\.(?<patch>[0-9]*)"/;
/**
 * @param {string} path
 * @returns {Promise<VersionNumber>}
 * */
async function getOldVersionFromFile(path) {
  const content = await fs.promises.readFile(path, "utf8");
  const parseResult = versionRegex.exec(content);
  if (!parseResult) {
    throw Error(`No version number found in '${path}'`);
  }
  const major = parseResult.groups?.major;
  const minor = parseResult.groups?.minor;
  const patch = parseResult.groups?.patch;

  if (!major || !minor || !patch) {
    throw Error("Fatal version number parsing error!");
  }
  return [parseInt(major), parseInt(minor), parseInt(patch)];
}

/**
 * @param {string} path
 * @param {VersionNumber} newVersion
 * @returns
 */
async function replaceVersionNumberWith(path, newVersion) {
  const content = await fs.promises.readFile(path, "utf8");
  const newContent = content.replace(
    versionRegex,
    `"version": "${newVersion.join(".")}"`
  );
  await fs.promises.writeFile(path, newContent);
}
