rm -r out
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
compress-archive -path out\musicman-linux-x64
compress-archive -path out\musicman-linux-arm64
compress-archive -path out\musicman-linux-armv7l
compress-archive -path out\musicman-win32-arm64
compress-archive -path out\musicman-win32-x64
compress-archive -path out\musicman-win32-ia32
