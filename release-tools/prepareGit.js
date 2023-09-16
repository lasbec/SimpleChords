import { exec as execCallback } from "child_process";
import { stat } from "fs";

/**
 * @param {string} command
 */
async function execShellCmd(command) {
  return new Promise((resolve, reject) => {
    execCallback(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
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

async function assertNoUncommitedChanges() {
  const { stdout: status } = await execShellCmd("git status");
  const validGitStatus = `Auf Branch master
Ihr Branch ist auf demselben Stand wie 'origin/master'.

nichts zu committen, Arbeitsverzeichnis unverändert
`;
  if (status !== validGitStatus) {
    console.error(
      //   "Current git status:\n",
      status,
      //   "Only exceptable status for releasing:\n",
      validGitStatus
    );
    throw new Error(`Current git stauts is not release ready.`);
  }
}

async function main() {
  const githubUser = await assertGitHubAuthentication();
  console.log(`GitHub user logged in: ${githubUser}.`);
  await assertNoUncommitedChanges();
}

main();
