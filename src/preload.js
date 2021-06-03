'use strict';
const fs = require('fs');
const os = require('os');
const url = require('url');

const { contextBridge, ipcRenderer, shell } = require('electron');

const mm = require('music-metadata');
const path = require('path');
const log = require('electron-log');


let playlist = [];
let playlistI = 0;
let picPath;

let miniplayerId;

log.catchErrors();

// Window Things //
contextBridge.exposeInMainWorld('windowControl', {
    maximize: () => { ipcRenderer.send('windowMsg', 0); },
    minimize: () => { ipcRenderer.send('windowMsg', 1); },
    close: () => { ipcRenderer.send('windowMsg', 2); }
});
ipcRenderer.on('windowMaximize', (event, arg) => {
    if (arg) {
        document.querySelector('#app_max_unmaximize').style.display = 'block';
        document.querySelector('#app_max_maximize').style.display = 'none';
    } else {
        document.querySelector('#app_max_unmaximize').style.display = 'none';
        document.querySelector('#app_max_maximize').style.display = 'block';
    }
});
// File //
let goodRndLst = [];
const fname = 'mm_musicman_coverart_temp';
contextBridge.exposeInMainWorld('file', {
    exportPl: () => {
        ipcRenderer.send('playlist-save', JSON.stringify(playlist));
    },
    importPl: () => {
        ipcRenderer.send('playlist-load');
    },
    remPl: (i) => {
        let info = -1;
        playlist.splice(i, 1);
        if (playlistI > i) {
            playlistI--;
        } else if (parseInt(playlistI) === parseInt(i)) {
            if (playlist.length === playlistI) {
                playlistI = 0;
            }
            info = 0;
        }
        if (playlist.length === 0) {
            info = 1;
        }
        goodRndLst = [];
        return info;
    },
    savePath: () => {
        const ret = ipcRenderer.sendSync('fileLoad');
        if (ret && ret.length) {
            playlist.push(...ret);
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
        goodRndLst = [];
    },
    getPath: () => {
        if (playlist[playlistI]) {
            return url.pathToFileURL(playlist[playlistI]).toString();
        }
    },
    getTitle: () => {
        if (path.parse(playlist[playlistI]).ext === '.weba') {
            return Promise.resolve({ common: {} });
        }
        const metadata = mm.parseFile(playlist[playlistI]);
        picPath = false;
        metadata.then((meta) => {
            if (meta.common.picture) {
                fs.writeFileSync(path.join(os.tmpdir(), fname), meta.common.picture[0].data);
                picPath = true;
            }
        });
        return metadata;
    },
    getPicPath: () => {
        if (picPath) {
            return url.pathToFileURL(path.join(os.tmpdir(), fname)).toString();
        }
    },
    loadFallBackTitle: () => {
        return path.parse(playlist[playlistI]).name;
    },
    continue: (loopState) => {
        if(loopState === 3){
            playlistI = Math.floor(Math.random() * (playlist.length));
            goodRndLst = [];
            return true;
        }
        if((loopState === 4 || loopState === 5) && playlist.length !== 1){
            if(playlist.length-1 === goodRndLst.length){
                if(loopState === 4) {goodRndLst = [];playlistI = 0;return false;}
                if(loopState === 5) goodRndLst = [];
            }
            goodRndLst.push(parseInt(playlistI));
            let newI = Math.floor(Math.random() * (playlist.length-goodRndLst.length));
            goodRndLst.sort((a, b) => a-b).forEach((v) => {
                    if(v <= newI) newI++;
            });
            playlistI = newI;
            return true;
        }
        playlistI++;
        goodRndLst = [];
        if (playlist.length === playlistI) {
            playlistI = 0;
            return loopState === 2;
        } else {
            return true;
        }
    },
    getTitles: async function() {
        const titles = [];
        for (let i = 0; i < playlist.length; i++) {
            const p = playlist[i];
            let title = '';
            if (path.parse(p).ext === '.weba') {
                title = path.parse(p).name;
            } else {
                const res = await mm.parseFile(p);
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
    document.querySelector('#lcfp').click();

    document.querySelector('#ltfp').click();
});
ipcRenderer.on('playlist-open-request', (e, a) => {
    playlist = JSON.parse(a);
    playlistI = 0;
    goodRndLst = [];
    document.querySelector('#lcfp').click();

    document.querySelector('#ltfp').click();
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
ipcRenderer.on('playlist-control', (e, exporting) => {
    exporting ? document.querySelector('#playlistExport').click() : document.querySelector('#playlistImport').click();
});
// InitCompleted //
contextBridge.exposeInMainWorld('init', {
    completed: () => {
        ipcRenderer.send('init-completed');
    }
});

ipcRenderer.on('miniplayer', (_, id) => {
    miniplayerId = id;
});

ipcRenderer.on('focused', (e, a) => {
    a ? document.body.classList.remove('winactive') : document.body.classList.add('winactive');
});

ipcRenderer.on('move', (_, a) => {
    if (playlist.length === 0) {
        return;
    }
    switch (a) {
    case 0: //next
        playlistI++;
        if (playlistI >= playlist.length) {
            playlistI = 0;
        }
        break;
    case 1: //last
        playlistI--;
        if (playlistI < 0) {
            playlistI = playlist.length - 1;
        }
        break;
    }
    goodRndLst = [];
    document.querySelector('#lcfp').click();
    document.querySelector('#ltfp').click();
});

ipcRenderer.on('miniplayerclick', () => {
    document.querySelector('#play').click();
});

contextBridge.exposeInMainWorld('miniplayer', {
    title: (title) => {
        ipcRenderer.sendTo(miniplayerId, 'title', title);
    },
    length: (length) => {
        ipcRenderer.sendTo(miniplayerId, 'length', length);
    },
    time: (time) => {
        ipcRenderer.sendTo(miniplayerId, 'time', time);
    },
    play: (playing) => {
        ipcRenderer.sendTo(miniplayerId, 'play', playing);
    },
    clear: () => {
        ipcRenderer.sendTo(miniplayerId, 'clear');
    }
});

contextBridge.exposeInMainWorld('version', {
    getVersion: () => {
        return ipcRenderer.sendSync('get-version');
    },
    openPage: () => {
        shell.openExternal('https://github.com/Git-J219/musicman/releases');
    }
});
