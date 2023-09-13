#! /bin bash
$releaseType = 

$newVersion = node ./update-version-number.js ($releaseType)

git stash
git checkout master
git add .
git commit -m "release $releaseType $newVersion"
git push origin master --force