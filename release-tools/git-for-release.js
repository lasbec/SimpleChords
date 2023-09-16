import { execShellCmd, execShellCmdRequireSuccess } from "./exec-shell.js";

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
