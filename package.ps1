rm -r out
$ghCurrent = $(gh config get prompt)
gh config set prompt disabled
electron-forge package --arch=x64 --platform=linux
electron-forge package --arch=arm64 --platform=linux
electron-forge package --arch=armv7l --platform=linux
electron-forge package --arch=arm64 --platform=win32
electron-forge package --arch=x64 --platform=win32
electron-forge package --arch=ia32 --platform=win32
cp 3rdParty out\musicman-linux-x64 -r
cp 3rdParty out\musicman-linux-arm64 -r
cp 3rdParty out\musicman-linux-armv7l -r
cp 3rdParty out\musicman-win32-arm64 -r
cp 3rdParty out\musicman-win32-x64 -r
cp 3rdParty out\musicman-win32-ia32 -r
compress-archive -path out\musicman-linux-x64 -destinationpath out\musicman-linux-x64.zip
compress-archive -path out\musicman-linux-arm64 -destinationpath out\musicman-linux-arm64.zip
compress-archive -path out\musicman-linux-armv7l -destinationpath out\musicman-linux-armv7l.zip
compress-archive -path out\musicman-win32-arm64 -destinationpath out\musicman-win32-arm64.zip
compress-archive -path out\musicman-win32-x64 -destinationpath out\musicman-win32-x64.zip
compress-archive -path out\musicman-win32-ia32 -destinationpath out\musicman-win32-ia32.zip
gh release create vunlabeled out\musicman-linux-x64.zip out\musicman-linux-arm64.zip out\musicman-linux-armv7l.zip out\musicman-win32-x64.zip out\musicman-win32-arm64.zip out\musicman-win32-ia32.zip -d
gh config set prompt $ghCurrent
