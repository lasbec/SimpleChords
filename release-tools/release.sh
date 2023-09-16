#! /bin bash
$releaseType = $1

git.assertAuthenticated
git.assertNoUncommitedChanges
git.assertNoUnpushedChanges
git.pull
git.assertMasterIsCheckedOut

git stash
git checkout master
git add .
git commit -m "release $releaseType $newVersion"
git push origin master --force

$newVersion = node ./update-version-number.js $releaseType
assertSuccessfulVersionUpcount

npm release $releaseType
