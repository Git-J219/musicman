var mainWindow;
var loading;
var masLoad;
var menuCommand;
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const log = require('electron-log');
const appleMenu = [{
        label: 'Musicman',
        submenu: [{
            label: 'Über Musicman',
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: 'Services',
            role: 'services',
            submenu: []
        }, {
            type: 'separator'
        }, {
            label: 'Musicman verstecken',
            accelerator: 'Command+H',
            role: 'hide'
        }, {
            label: 'Andere verstecken',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
        }, {
            label: 'Alle zeigen',
            role: 'unhide'
        }, {
            type: 'separator'
        }, {
            label: 'Beenden',
            accelerator: 'Command+Q',
            click: () => {
                app.quit()
            }
        }]
    },
    {
        label: 'Datei',
        submenu: [{
                label: 'Öffnen',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    if (loading) {
                        menuCommand = 0;
                    } else if (BrowserWindow.getAllWindows().length === 0) {
                        menuCommand = 0;
                        createWindow();
                    } else {
                        mainWindow.webContents.send('open-requested', true);
                    }
                }
            },
            {
                label: 'Zur Playlist hinzufügen',
                accelerator: 'CmdOrCtrl+Shift+O',
                click: () => {
                    if (loading) {
                        menuCommand = 1;
                    } else if (BrowserWindow.getAllWindows().length === 0) {
                        menuCommand = 1;
                        createWindow();
                    } else {
                        mainWindow.webContents.send('open-requested', false);
                    }
                }
            },
            {
                label: 'Playlist exportieren',
                accelerator: 'CmdOrCtrl+E',
                click: () => {
                    if (!(loading || BrowserWindow.getAllWindows.length === 0)) {
                        mainWindow.webContents.send('playlist-control', true);
                    }
                }
            },
            {
                label: 'Playlist importieren',
                accelerator: 'CmdOrCtrl+I',
                click: () => {
                    if (loading) {
                        menuCommand = 2;
                    } else if (BrowserWindow.getAllWindows().length === 0) {
                        menuCommand = 2;
                        createWindow();
                    } else {
                        mainWindow.webContents.send('playlist-control', false);
                    }
                }
            }
        ]
    }
];
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}
if (!app.requestSingleInstanceLock()) {
    app.quit();
}
const createWindow = () => {
    // Create the browser window.
    let info = {
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        },
        icon: path.join(__dirname, "icons", "icon.png"),
        show: false
    }
    loading = new BrowserWindow({ transparent: true, width: 580, height: 140, frame: false, webPreferences: { contextIsolation: true }, show: false });
    loading.setMinimumSize(580, 140);
    loading.setMaximumSize(580, 140);
    loading.setAlwaysOnTop(true);
    loading.on("close", (e) => {
        e.preventDefault();
    });
    loading.setMinimizable(false);
    loading.setMaximizable(false);
    loading.loadFile(path.join(__dirname, 'loading', 'loading.html'));
    loading.on("ready-to-show", loading.show);
    if (process.platform === "darwin") {
        info.frame = true;
        info.titleBarStyle = "hidden";
    }
    mainWindow = new BrowserWindow(info);
    mainWindow.setMinimumSize(600, 600);
    mainWindow.addListener("maximize", () => {
        mainWindow.webContents.send("windowMaximize", mainWindow.isMaximized());
    });
    mainWindow.addListener("unmaximize", () => {
        mainWindow.webContents.send("windowMaximize", mainWindow.isMaximized());
    });
    mainWindow.addListener("blur", () => {
        mainWindow.webContents.send("focused", false);
    });
    mainWindow.addListener("focus", () => {
        mainWindow.webContents.send("focused", true);
    });
    mainWindow.addListener("close", () => {
        mainWindow.hide();
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => Menu.setApplicationMenu(Menu.buildFromTemplate(appleMenu)));
app.on('ready', createWindow);

function secInt(arg) {
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.focus();
    if (loading.isDestroyed()) {
        arg.forEach(element => {
            if (element != arg[0] && element[0] != '-') {
                if (path.parse(element).ext == ".mmpl") {
                    mainWindow.webContents.send('playlist-open-request', fs.readFileSync(element, 'utf8'));
                    return;
                }
                mainWindow.webContents.send('file-open-request', element);
            }
        });
    }

}
app.on('second-instance', (e, arg) => {
    secInt(arg);
});
app.on('open-file', (e, a) => {
    e.preventDefault();
    log.debug(a);
    if (loading) {
        if (BrowserWindow.getAllWindows().length === 0) {
            masLoad = a;
            createWindow();
        } else {
            secInt(["-", a]);
        }
    } else {
        masLoad = a;
    }
    log.debug(masLoad);
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on('before-quit', () => {
    if (!loading.isDestroyed()) {
        loading.removeAllListeners('close');
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('mos', (event, arg) => {
    event.sender.send('mosUpdate', process.platform === 'darwin');
});
ipcMain.on('windowMsg', (event, arg) => {
    switch (arg) {
        case 0:
            //maximize
            mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
            break;
        case 1:
            //minimize
            mainWindow.minimize();
            break;
        case 2:
            //close
            mainWindow.close();
            break;
    }
});
ipcMain.on('init-completed', () => {
    loading.destroy();
    procarg = process.argv;
    mainWindow.show();
    if (masLoad) {
        procarg = ["-", masLoad];
        masLoad = false;
    }
    log.debug("Opened With Arguments:");
    log.debug(procarg);
    procarg.forEach(element => {
        if (element != process.argv0 && element[0] != '-' && element != ".") {
            if (path.parse(element).ext == ".mmpl") {
                mainWindow.webContents.send('playlist-open-request', fs.readFileSync(element, 'utf8'));
                return;
            }
            mainWindow.webContents.send('file-open-request', element);
        }
    });
    if (menuCommand === undefined) {
        switch (menuCommand) {
            case 0:
                mainWindow.webContents.send('open-requested', true);
                break;
            case 1:
                mainWindow.webContents.send('open-requested', false);
                break;
            case 2:
                mainWindow.webContents.send('playlist-control', false);
                break;
        }
        menuCommand = undefined;
    }
});
ipcMain.on('fileLoad', (event) => {
    dialog.showOpenDialog({
        filters: [{
                name: "Musik",
                extensions: ['flac', 'mp3', 'wav', 'ogg', 'oga', 'weba', 'm4a']
            },
            { name: "Alle Dateien", extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
    }).then((file) => {
        event.returnValue = file.filePaths;
    })
});
ipcMain.on('playlist-save', (e, a) => {
    dialog.showSaveDialog({
        filters: [{
            name: "Musicman Playlist",
            extensions: ['mmpl']
        }]
    }).then((file) => {
        if (!file.canceled) {
            fs.writeFileSync(file.filePath, a, 'utf8');
        }
    });
});
ipcMain.on('playlist-load', () => {
    dialog.showOpenDialog({
        filters: [{
            name: "Musicman Playlist",
            extensions: ['mmpl']
        }]
    }).then((file) => {
        if (!file.canceled) {
            mainWindow.webContents.send('playlist-open-request', fs.readFileSync(file.filePaths[0], 'utf8'));
        }
    });
});