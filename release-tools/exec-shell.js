import { exec as execCallback } from "child_process";
/**
 * @typedef {import("child_process").ExecException} ExecException
 */

/**
 * @param {string} command
 * @returns {Promise<ShellCmdExecutionResult>}
 */
export async function execShellCmd(command) {
  return new Promise((resolve, reject) => {
    execCallback(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

/**
 * @param {string} command
 * @returns {Promise<string>}
 */
export async function execShellCmdRequireSuccess(command) {
  const result = await execShellCmd(command);
  if (result.error) {
    throw new Error(
      `Execution of '${command}' failed: ${result.error.message}`
    );
  }
  if (result.stderr) {
    throw new Error(
      `Execution of '${command}' failed (stderr): ${result.stderr}`
    );
  }
  return result.stdout;
}

/**
 * @typedef {object} ShellCmdExecutionResult
 * @property {ExecException | null} error
 * @property {string} stdout
 * @property {string} stderr
 */
