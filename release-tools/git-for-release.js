import { exec as execCallback } from "child_process";
/**
 * @typedef {import("child_process").ExecException} ExecException
 */

/**
 * @param {string} commitMsg
 */
export async function pushReleaseCommit(commitMsg) {
  await execShellCmdRequireSuccess("git add .");
  await execShellCmdRequireSuccess(`git commit -m "${commitMsg}"`);
  const pushResult = await execShellCmd("git push");
  if (pushResult.error) throw pushResult.error;
  const expectdStderrRegex =
    /To github.com:lasbec\/SimpleChords.git[\r\n]+.*master -> master/;
  if (!expectdStderrRegex.exec(pushResult.stderr)) {
    // 'git push' sends some string to stderr even on sucess
    throw new Error(`Unexpected stderr for 'git push': ${pushResult.stderr}`);
  }
}

export async function assertRepositoryIsReleaseReady() {
  const githubUser = await assertGitHubAuthentication();
  console.log(`GitHub user logged in: ${githubUser}.`);
  await checkGitStatus();
}

/**
 * @param {string} command
 * @returns {Promise<ShellCmdExecutionResult>}
 */
async function execShellCmd(command) {
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
async function execShellCmdRequireSuccess(command) {
  const result = await execShellCmd(command);
  if (result.error) {
    throw new Error(`Execution of ${command} failed: ${result.error.message}`);
  }
  if (result.stderr) {
    throw new Error(
      `Execution of ${command} failed (stderr): ${result.stderr}`
    );
  }
  return result.stdout;
}

/** Return the name of user logged in */
async function assertGitHubAuthentication() {
  const { error, stdout, stderr } = await execShellCmd("ssh -T git@github.com");
  const githubLoginCheckRegex =
    /Hi (?<username>.*)! You've successfully authenticated, but GitHub does not provide shell access./;
  const parseResult = githubLoginCheckRegex.exec(stderr);
  if (!parseResult) {
    throw new Error(
      `Unexpected stderr from 'ssh -T git@github.com' ${stderr}.`
    );
  }
  return parseResult.groups?.username;
}

async function checkGitStatus() {
  const { stdout: status } = await execShellCmd("git status");
  const validGitStatus = `Auf Branch master
Ihr Branch ist auf demselben Stand wie 'origin/master'.

nichts zu committen, Arbeitsverzeichnis unverändert
`;
  if (status !== validGitStatus) {
    throw new Error(`Current git stauts is not release ready.`);
  }
}

/**
 * @typedef {object} ShellCmdExecutionResult
 * @property {ExecException | null} error
 * @property {string} stdout
 * @property {string} stderr
 */
