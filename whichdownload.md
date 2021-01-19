# Musicman - Welche Version?
## Windows
Windows-Taste + R drücken und `cmd` eingeben.
Dort dann `wmic OS get OSArchitecture` eingeben.
Dann ist 32bit = ia32 und 64bit = x64. Andere Sachen sind arm64
Deine Datei ist dann: musicman-windows-*dein Ergebnis*.zip
## Linux
Öffne das Terminal.
Mit `uname -m` bekommst du deine Architektur und nimmst dann diesen Download: musicman-linux-*dein Ergebnis*.zip
## Mac-OS
Aktuell weiss ich nicht wie man das herausfindet. musicman-darwin-x64.zip sollte funktionieren.
