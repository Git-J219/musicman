const { ipcRenderer, contextBridge } = require('electron');

let mainId;

let len;

ipcRenderer.on('mainId', (_, id) => {
    mainId = id;
});

ipcRenderer.on('title', (_, title) => {
    document.querySelector('#title').innerText = title;
});

ipcRenderer.on('length', (_, length) => {
    len = length;
});

ipcRenderer.on('time', (_, time) => {
    document.querySelector('#positionInner').style.width = `${(100/len)*time}%`;
});

ipcRenderer.on('play', (_, playing) => {
    document.querySelector('#pausing').style.display = playing ? 'none' : '';
    document.querySelector('#playing').style.display = playing ? '' : 'none';
});

ipcRenderer.on('clear', () => {
    document.querySelector('#title').innerText = 'Kein Titel';
    document.querySelector('#positionInner').style.width = '0';
    document.querySelector('#pausing').style.display = '';
    document.querySelector('#playing').style.display = 'none';
});

contextBridge.exposeInMainWorld('play', {
    play: () => ipcRenderer.sendTo(mainId, 'miniplayerclick')
});
