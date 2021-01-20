$null = rm -r out
echo "Der Ausgabeordner wurde gelöscht"
$ghCurrent = $(gh config get prompt)
$null = gh config set prompt disabled
echo "Verpacken: linux x64"
$null = electron-forge package --arch=x64 --platform=linux
echo "Verpacken: linux arm64"
$null = electron-forge package --arch=arm64 --platform=linux
echo "Verpacken: linux armv7l"
$null = electron-forge package --arch=armv7l --platform=linux
echo "Verpacken: win32 arm64"
$null = electron-forge package --arch=arm64 --platform=win32
echo "Verpacken: win32 x64"
$null = electron-forge package --arch=x64 --platform=win32
echo "Verpacken: win32 ia32"
$null = electron-forge package --arch=ia32 --platform=win32
echo "Lizensen kopieren: linux x64"
$null = cp 3rdParty out\musicman-linux-x64 -r
echo "Lizensen kopieren: linux arm64"
$null = cp 3rdParty out\musicman-linux-arm64 -r
echo "Lizensen kopieren: linux armv7l"
$null = cp 3rdParty out\musicman-linux-armv7l -r
echo "Lizensen kopieren: win32 arm64"
$null = cp 3rdParty out\musicman-win32-arm64 -r
echo "Lizensen kopieren: win32 x64"
$null = cp 3rdParty out\musicman-win32-x64 -r
echo "Lizensen kopieren: win32 ia32"
$null = cp 3rdParty out\musicman-win32-ia32 -r
echo "ZIP: linux x64"
$null = compress-archive -path out\musicman-linux-x64 -destinationpath out\musicman-linux-x64.zip
echo "ZIP: linux arm64"
$null = compress-archive -path out\musicman-linux-arm64 -destinationpath out\musicman-linux-arm64.zip
echo "ZIP: linux armv7l"
$null = compress-archive -path out\musicman-linux-armv7l -destinationpath out\musicman-linux-armv7l.zip
echo "ZIP: win32 arm64"
$null = compress-archive -path out\musicman-win32-arm64 -destinationpath out\musicman-win32-arm64.zip
echo "ZIP: win32 x64"
$null = compress-archive -path out\musicman-win32-x64 -destinationpath out\musicman-win32-x64.zip
echo "ZIP: win32 ia32"
$null = compress-archive -path out\musicman-win32-ia32 -destinationpath out\musicman-win32-ia32.zip
echo "Hochladen..."
$null = gh release create vunlabeled out\musicman-linux-x64.zip out\musicman-linux-arm64.zip out\musicman-linux-armv7l.zip out\musicman-win32-x64.zip out\musicman-win32-arm64.zip out\musicman-win32-ia32.zip -d
gh config set prompt $ghCurrent
