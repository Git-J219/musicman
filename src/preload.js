const { contextBridge, ipcRenderer, } = require('electron');
const url = require('url');
const mm = require('music-metadata');
const fs = require('fs');
const os = require('os');
const path = require('path');
const log = require('electron-log');
log.catchErrors();
// log //
contextBridge.exposeInMainWorld('log', log.functions);
// Window Things //
contextBridge.exposeInMainWorld('windowControl', {
    maximize: () => { ipcRenderer.send('windowMsg', 0) },
    minimize: () => { ipcRenderer.send('windowMsg', 1) },
    close: () => { ipcRenderer.send('windowMsg', 2) }
});
ipcRenderer.on("windowMaximize", (event, arg) => {
    if (arg) {
        document.querySelector("#app_max_unmaximize").style.display = "block";
        document.querySelector("#app_max_maximize").style.display = "none";
    } else {
        document.querySelector("#app_max_unmaximize").style.display = "none";
        document.querySelector("#app_max_maximize").style.display = "block";
    }
});
// File //
const fname = "mm_musicman_coverart_temp";
var cPath;
var picPath;
contextBridge.exposeInMainWorld('file', {
    savePath: () => {
        var ret = ipcRenderer.sendSync('fileLoad');
        cPath = ret;
        if (ret) {
            return true;
        } else {
            return false;
        }

    },
    getPath: () => {
        if (cPath) {
            return url.pathToFileURL(cPath).toString();
        } else {
            return;
        }
    },
    getTitle: () => {
        if (path.parse(cPath).ext == '.weba') {
            return Promise.resolve({ common: {} })
        }
        let mmmmmmmmmmmmmmmmmmmm = mm.parseFile(cPath);
        picPath = false;
        mmmmmmmmmmmmmmmmmmmm.then((meta) => {
            if (meta.common.picture) {
                fs.writeFileSync(path.join(os.tmpdir(), fname), meta.common.picture[0].data);
                picPath = true;
            }
        });
        return mmmmmmmmmmmmmmmmmmmm
    },
    getPicPath: () => {
        if (picPath) {
            return url.pathToFileURL(path.join(os.tmpdir(), fname)).toString();
        } else {
            return;
        }
    },
    loadFallBackTitle: () => {
        return path.parse(cPath).name;
    }
});
// Open-Request from Main Process
ipcRenderer.on('file-open-request', (_e, arg) => {
    cPath = arg;
    document.querySelector('#lcfp').click();
});
// MOS //
contextBridge.exposeInMainWorld('mos', {
    mos: () => {
        ipcRenderer.send('mos');
    }
});
ipcRenderer.on('mosUpdate', (event, arg) => {
    arg ? document.body.classList.add('mos') : document.body.classList.remove('mos');
});
// FileLoadRequest //
ipcRenderer.on('open-requested', () => {
    document.querySelector('#menuOpen').click();
});
// InitCompleted //
contextBridge.exposeInMainWorld('init', {
    completed: () => {
        ipcRenderer.send('init-completed');
    }
});