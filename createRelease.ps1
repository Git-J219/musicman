if($args[0] -ne "patch" -And $args[0] -ne "minor" -And $args[0] -ne "major"){
Write-Error "Bitte patch, minor oder major angeben"
exit 1
}
npm version $args[0]
git pull
git push
git push --tags
