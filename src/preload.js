const { contextBridge, ipcRenderer, } = require('electron');
const url = require('url');
const mm = require('music-metadata');
const fs = require('fs');
const os = require('os');
const path = require('path');
const log = require('electron-log');
var playlist = [];
var playlistI = 0;
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
var picPath;
contextBridge.exposeInMainWorld('file', {
    remPl: (i) => {
        var info = -1;
        playlist.splice(i, 1);
        if (playlistI > i) {
            playlistI--;
        } else if (playlistI == i) {
            if (playlist.length == playlistI) {
                playlistI = 0;
                info = 0;
            }
        }
        if (playlist.length == 0) {
            info = 1;
        }
        return info;
    },
    savePath: () => {
        var ret = ipcRenderer.sendSync('fileLoad');
        if (ret) {
            playlist.push(ret);
            return true;
        }
        return false;
    },
    loadLast: () => {
        playlistI = playlist.length - 1;
    },
    getLen: () => {
        return playlist.length;
    },
    loadNum: (num) => {
        playlistI = num;
    },
    getPath: () => {
        if (playlist[playlistI]) {
            return url.pathToFileURL(playlist[playlistI]).toString();
        } else {
            return;
        }
    },
    getTitle: () => {
        if (path.parse(playlist[playlistI]).ext == '.weba') {
            return Promise.resolve({ common: {} })
        }
        let mmmmmmmmmmmmmmmmmmmm = mm.parseFile(playlist[playlistI]);
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
        return path.parse(playlist[playlistI]).name;
    },
    continue: () => {
        playlistI++;
        if (playlist.length == playlistI) {
            playlistI = 0;
            return false;
        } else {
            return true;
        }
    },
    getTitles: async function() {
        var titles = [];
        for (let i = 0; i < playlist.length; i++) {
            const p = playlist[i];
            var title = "";
            if (path.parse(p).ext === '.weba') {
                title = path.parse(p).name;
            } else {
                let res = await mm.parseFile(p);
                title = res.common.title ? res.common.title : path.parse(p).name;
            }
            titles.push(title);
        }
        return [titles, playlistI];
    }
});
// Open-Request from Main Process
ipcRenderer.on('file-open-request', (_e, arg) => {
    playlist.push(arg);
    playlistI = playlist.length - 1;
    document.querySelector("#lcfp").click();

    document.querySelector("#ltfp").click();
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
ipcRenderer.on('open-requested', (e, a) => {
    a ? document.querySelector('#menuOpenInstant').click() : document.querySelector('#menuOpen').click();
});
// InitCompleted //
contextBridge.exposeInMainWorld('init', {
    completed: () => {
        ipcRenderer.send('init-completed');
    }
});