/* global windowControl:false, file:false, mos:false, init:false miniplayer:false version:false */
'use strict';
mos.mos();
if (localStorage.getItem('lastDate') !== `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`) {
    fetch('https://api.github.com/repos/Git-J219/musicman/tags')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.message) {
                return;
            }
            const mmVersion = `v${version.getVersion()}`;
            if (data[0].name !== mmVersion && data[0].name !== localStorage.getItem('disabledVersion')) {
                // New Version showable: data[0].name
                localStorage.setItem('lastDate', `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`);
                localStorage.setItem('lastVersion', data[0].name);
                showVersion(data[0].name);
            }
        })
        .catch(function (err) {
            console.log('error while loading updates: ', err);
        });
} else {
    const mmVersion = `v${version.getVersion()}`;
    if (localStorage.getItem('lastVersion') !== mmVersion && localStorage.getItem('lastVersion') !== localStorage.getItem('disabledVersion')) {
        showVersion(localStorage.getItem('lastVersion'));
    }
}
function showVersion(newVersion) {
    newVersion = newVersion.slice(1);
    document.querySelector('#newVer').innerText = newVersion;
    document.querySelector('#update').style.display = '';
}

[...document.querySelectorAll('.dropdown a')].forEach((dropdownClose) => {
    dropdownClose.addEventListener('click', function() {
        const drops = [...document.querySelectorAll('.dropdown-content')];
        drops.forEach(drop => {
            drop.style.display = 'none';
            setTimeout(() => {
                drop.style.display = '';
            }, 5);
        });
    });
});
let titleScroll = 0;
let loopState = 0;
document.querySelector('#loopingState').addEventListener('click', (e) => {
    loopState++;
    if(loopState === 3 && !e.shiftKey) loopState++;
    if (loopState === 6) {
        loopState = 0;
    }
    updateValuesAll();
});

function loadTitles() {
    titleScroll = document.querySelector('#playlist').scrollTop;
    file.getTitles().then(info => {
        const titles = info[0];
        const playlist = document.createElement('div');
        playlist.style.height = '100%';
        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const item = document.createElement('div');
            item.setAttribute('data-pos', i);
            item.innerText = title;
            if (parseInt(info[1]) === parseInt(i)) {
                item.style.backgroundColor = '#777';
            }
            playlist.appendChild(item);
        }
        const oCl = (e) => {
            if (e.target.id !== 'playlist') {
                file.loadNum(e.target.getAttribute('data-pos'));

                loadCurrent();
                loadTitles();
            }
        };
        playlist.addEventListener('click', oCl);
        playlist.addEventListener('contextmenu', (e) => {
            if (e.target.id !== 'playlist') {
                switch (file.remPl(e.target.getAttribute('data-pos'))) {
                case 0:
                    loadCurrent();
                    break;
                case 1:
                    document.querySelector('audio').src = 'about:blank';
                    document.querySelector('#pos').max = 0;
                    document.querySelector('#pausing').style.display = '';
                    document.querySelector('#playing').style.display = 'none';
                    document.querySelector('#img').style.display = 'none';
                    document.querySelector('#imgP').style.display = '';
                    document.querySelector('title').innerText = 'Musicman';
                    document.querySelector('#title').innerText = 'Musicman';
                    miniplayer.clear();
                    break;
                }
                loadTitles();
            }
        });
        document.querySelector('#playlistOuter').innerHTML = '';
        document.querySelector('#playlistOuter').appendChild(playlist);
        playlist.id = 'playlist';
        playlist.scrollTo(0, titleScroll);
    });
}

const loadCurrent = function() {
    document.querySelector('#load').style.display = '';
    document.querySelector('audio').src = file.getPath();
    document.querySelector('audio').loop = loopState === 1;
    file.getTitle().then((meta) => {
        document.querySelector('title').innerText = `${(meta.common.title ? meta.common.title : file.loadFallBackTitle())} - Musicman`;
        document.querySelector('#title').innerText = `${(meta.common.title ? meta.common.title : file.loadFallBackTitle())} - Musicman`;
        miniplayer.title(meta.common.title ? meta.common.title : file.loadFallBackTitle());
        const fcheck = () => {
            const fpp = file.getPicPath();
            if (fpp) {
                document.querySelector('#img').style.backgroundImage = `url(${fpp}?${new Date().getTime()})`;
                document.querySelector('#img').style.display = '';
                document.querySelector('#imgP').style.display = 'none';
                document.querySelector('#load').style.display = 'none';
            } else {
                window.setTimeout(fcheck, 1000);
            }
        };
        document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
        if (meta.common.picture) {
            fcheck();
        } else {
            document.querySelector('#img').style.display = 'none';
            document.querySelector('#imgP').style.display = '';
            document.querySelector('#load').style.display = 'none';
        }
    });
};
document.querySelector('#lcfp').addEventListener('click', loadCurrent);
document.querySelector('#ltfp').addEventListener('click', loadTitles);
document.querySelector('#menuOpen').addEventListener('click', () => {
    document.querySelector('audio').playbackRate = 0;
    window.setTimeout(() => {
        const len = file.getLen();
        const res = file.savePath();
        document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
        if (res && document.querySelector('audio').ended) {
            file.continue();
        }
        if (res && (len === 0 || document.querySelector('audio').ended)) {
            loadCurrent();
        }
        if (res) {
            loadTitles();
        }
    }, 0);
});
document.querySelector('#menuOpenInstant').addEventListener('click', () => {
    document.querySelector('audio').playbackRate = 0;
    window.setTimeout(() => {
        const res = file.savePath();
        document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
        if (res) {
            file.loadLast();
            loadCurrent();
            loadTitles();
        }
    });
});
document.querySelector('#playlistExport').addEventListener('click', file.exportPl);
document.querySelector('#playlistImport').addEventListener('click', file.importPl);
document.querySelector('audio').addEventListener('ended', () => {
    if (file.continue(loopState)) {
        loadCurrent();
        loadTitles();
    }
});
/*
        {
            pan: 0,
            vol: 1,
            speed: 1,
            comp: false,
            loop: false
        }
    */
const settings = JSON.parse(localStorage.getItem('settings') ? localStorage.getItem('settings') : '{"pan":0,"vol": 1,"speed": 1,"comp": false,"loop": false,"threshold":-24,"knee":30,"ratio":12,"attack":0.003,"release":0.25}');
document.querySelector('#pan').value = settings.pan;
document.querySelector('#vol').value = settings.vol;
document.querySelector('#speed').value = settings.speed;
document.querySelector('#comp').checked = settings.comp;

loopState = settings.loop;

document.querySelector('#threshold').value = settings.threshold;
document.querySelector('#knee').value = settings.knee;
document.querySelector('#ratio').value = settings.ratio;
document.querySelector('#attack').value = settings.attack;
document.querySelector('#release').value = settings.release;
window.addEventListener('beforeunload', () => {
    localStorage.setItem('settings', JSON.stringify({
        pan: document.querySelector('#pan').value,
        vol: document.querySelector('#vol').value,
        speed: document.querySelector('#speed').value,
        comp: document.querySelector('#comp').checked,
        loop: loopState,
        threshold: document.querySelector('#threshold'),
        knee: document.querySelector('#knee').value,
        ratio: document.querySelector('#ratio').value,
        attack: document.querySelector('#attack').value,
        release: document.querySelector('#release').value
    }));
});

const audCon = new AudioContext();
const audSrc = audCon.createMediaElementSource(document.querySelector('audio'));
const audCom = new DynamicsCompressorNode(audCon); // DynamicsCompressorNode
const audPan = new StereoPannerNode(audCon); // StereoPannerNode
const audVol = new GainNode(audCon); // GainNode
function updateValuesAll() {
    audPan.pan.value = document.querySelector('#pan').value;
    parseFloat(document.querySelector('#pan').value) === 0 ? document.querySelector('#panTrue').style.display = 'none' : document.querySelector('#panTrue').style.display = '';
    parseFloat(document.querySelector('#pan').value) !== 0 ? document.querySelector('#panFalse').style.display = 'none' : document.querySelector('#panFalse').style.display = '';
    document.querySelector('#panAmount').innerText = Math.round(Math.abs(audPan.pan.value) * 100.0);
    document.querySelector('#panDir').innerText = audPan.pan.value < 0 ? 'links' : 'rechts';

    audVol.gain.value = document.querySelector('#vol').value;
    document.querySelector('#volLabel').innerText = Math.round(document.querySelector('#vol').value * 100.0);

    document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
    document.querySelector('#speedVal').innerText = Math.round(document.querySelector('audio').playbackRate * 100.0);

    document.querySelector('#resetCom').addEventListener('click', () => {
        document.querySelector('#threshold').value = -24;
        document.querySelector('#knee').value = 30;
        document.querySelector('#ratio').value = 12;
        document.querySelector('#attack').value = 0.003;
        document.querySelector('#release').value = 0.25;
        updateValuesAll();
    });
    document.querySelector('#resetCom2').addEventListener('click', () => {
        document.querySelector('#threshold').value = -24;
        document.querySelector('#knee').value = 30;
        document.querySelector('#ratio').value = 12;
        document.querySelector('#attack').value = 0.003;
        document.querySelector('#release').value = 0.25;
        updateValuesAll();
    });

    document.querySelector('#loopingState').innerText = loopState === 0 ? 'Keine Wiederholung' : loopState === 1 ? 'Lied wiederholen' : loopState === 2 ? 'Alles wiederholen' : loopState === 3 ? 'Zufall (einfach)' : loopState === 4 ? 'Zufall' : 'Zufall (wiederholen)';

    audSrc.disconnect();
    audCom.disconnect();
    if (document.querySelector('#comp').checked) {
        audSrc.connect(audCom).connect(audPan);
    } else {
        audSrc.connect(audPan);
    }

    document.querySelector('audio').loop = loopState === 1;
    audCom.threshold.value = document.querySelector('#threshold').value;
    audCom.knee.value = document.querySelector('#knee').value;
    audCom.ratio.value = document.querySelector('#ratio').value;
    audCom.attack.value = document.querySelector('#attack').value;
    audCom.release.value = document.querySelector('#release').value;
    document.querySelector('#thresholdInfo').innerText = document.querySelector('#threshold').value;
    document.querySelector('#kneeInfo').innerText = document.querySelector('#knee').value;
    document.querySelector('#ratioInfo').innerText = document.querySelector('#ratio').value;
    document.querySelector('#attackInfo').innerText = document.querySelector('#attack').value;
    document.querySelector('#releaseInfo').innerText = document.querySelector('#release').value;
}
// Connection //
audSrc.connect(audCom).connect(audPan).connect(audVol).connect(audCon.destination);
// Events //
document.querySelector('#threshold').addEventListener('input', () => {
    audCom.threshold.value = document.querySelector('#threshold').value;
    document.querySelector('#thresholdInfo').innerText = document.querySelector('#threshold').value;
});
document.querySelector('#knee').addEventListener('input', () => {
    audCom.knee.value = document.querySelector('#knee').value;
    document.querySelector('#kneeInfo').innerText = document.querySelector('#knee').value;
});
document.querySelector('#ratio').addEventListener('input', () => {
    audCom.ratio.value = document.querySelector('#ratio').value;
    document.querySelector('#ratioInfo').innerText = document.querySelector('#ratio').value;
});
document.querySelector('#attack').addEventListener('input', () => {
    audCom.attack.value = document.querySelector('#attack').value;
    document.querySelector('#attackInfo').innerText = document.querySelector('#attack').value;
});
document.querySelector('#release').addEventListener('input', () => {
    audCom.release.value = document.querySelector('#release').value;
    document.querySelector('#releaseInfo').innerText = document.querySelector('#release').value;
});
document.querySelector('#pan').addEventListener('input', () => {
    audPan.pan.value = document.querySelector('#pan').value;
    parseFloat(document.querySelector('#pan').value) === 0 ? document.querySelector('#panTrue').style.display = 'none' : document.querySelector('#panTrue').style.display = '';
    parseFloat(document.querySelector('#pan').value) !== 0 ? document.querySelector('#panFalse').style.display = 'none' : document.querySelector('#panFalse').style.display = '';
    document.querySelector('#panAmount').innerText = Math.round(Math.abs(audPan.pan.value) * 100.0);
    document.querySelector('#panDir').innerText = audPan.pan.value < 0 ? 'links' : 'rechts';
});
document.querySelector('#vol').addEventListener('input', () => {
    audVol.gain.value = document.querySelector('#vol').value;
    document.querySelector('#volLabel').innerText = Math.round(document.querySelector('#vol').value * 100.0);
});
document.querySelector('#speed').addEventListener('input', () => {
    document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
    document.querySelector('#speedVal').innerText = Math.round(document.querySelector('audio').playbackRate * 100.0);
});
document.querySelector('#comp').addEventListener('input', () => {
    if (document.querySelector('#comp').checked) {
        audSrc.disconnect();
        audSrc.connect(audCom).connect(audPan);
    } else {
        audSrc.disconnect();
        audCom.disconnect();
        audSrc.connect(audPan);
    }
});
document.querySelector('audio').addEventListener('play', () => {
    document.querySelector('#playing').style.display = '';
    document.querySelector('#pausing').style.display = 'none';
    document.querySelector('#notplaying').style.display = 'none';
});
document.querySelector('audio').addEventListener('pause', () => {
    document.querySelector('#playing').style.display = 'none';
    document.querySelector('#pausing').style.display = '';
    document.querySelector('#notplaying').style.display = '';
});
document.querySelector('#resetPan').addEventListener('click', () => {
    document.querySelector('#pan').value = 0;
    updateValuesAll();
});
document.querySelector('#resetVol').addEventListener('click', () => {
    document.querySelector('#vol').value = 1;
    updateValuesAll();
});
document.querySelector('#resetSpeed').addEventListener('click', () => {
    document.querySelector('#speed').value = 1;
    updateValuesAll();
});
document.querySelector('audio').addEventListener('timeupdate', () => {
    document.querySelector('#pos').value = document.querySelector('audio').currentTime;
    document.querySelector('#playedAll').innerText = new Date(Math.round(document.querySelector('audio').currentTime) * 1000).toISOString().substr(11, 8);
    miniplayer.time(document.querySelector('audio').currentTime);
});
document.querySelector('audio').addEventListener('loadedmetadata', () => {
    document.querySelector('#pos').max = Math.round(document.querySelector('audio').duration);
    miniplayer.length(Math.round(document.querySelector('audio').duration));
});

document.querySelector('#play').addEventListener('click', () => {
    if (document.querySelector('audio').ended) {
        loadCurrent();
        loadTitles();
    }
    if (!document.querySelector('audio').paused) {
        document.querySelector('audio').pause();
    } else {
        document.querySelector('audio').play();
    }
});
document.querySelector('#pos').addEventListener('mousedown', () => {
    document.querySelector('audio').playbackRate = 0;
});
document.querySelector('audio').addEventListener('play', () => {
    miniplayer.play(true);
});
document.querySelector('audio').addEventListener('pause', () => {
    miniplayer.play(false);
});
document.querySelector('#pos').addEventListener('mouseup', () => {
    document.querySelector('audio').currentTime = document.querySelector('#pos').value;
    document.querySelector('audio').playbackRate = document.querySelector('#speed').value;
});
document.querySelector('#pos').addEventListener('input', () => {
    document.querySelector('#playedAll').innerText = new Date(document.querySelector('#pos').value * 1000).toISOString().substr(11, 8);
});
document.querySelector('#reset').addEventListener('click', () => {
    document.querySelector('#pan').value = 0;
    document.querySelector('#vol').value = 1;
    document.querySelector('#speed').value = 1;

    document.querySelector('#comp').checked = false;
    document.querySelector('#threshold').value = -24;
    document.querySelector('#knee').value = 30;
    document.querySelector('#ratio').value = 12;
    document.querySelector('#attack').value = 0.003;
    document.querySelector('#release').value = 0.25;

    loopState = 0;
    updateValuesAll();
});
updateValuesAll();

document.querySelector('#modal-btn_com').addEventListener('click', () => {
    document.querySelector('.modal_com').style.display = 'block';
});
document.querySelector('.close-btn_com').addEventListener('click', () => {
    document.querySelector('.modal_com').style.display = 'none';
});
document.querySelector('.modal_com').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modal_com')) {
        document.querySelector('.modal_com').style.display = 'none';
    }
});

document.querySelector('#update').addEventListener('click', () => {
    document.querySelector('.modal_update').style.display = 'block';
});
document.querySelector('.close-btn_update').addEventListener('click', () => {
    document.querySelector('.modal_update').style.display = 'none';
});
document.querySelector('.modal_update').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modal_update')) {
        document.querySelector('.modal_update').style.display = 'none';
    }
});

document.querySelector('#updateOpen').addEventListener('click', version.openPage);
document.querySelector('#updateClose').addEventListener('click', () => {
    document.querySelector('.modal_update').style.display = 'none';
    document.querySelector('#update').style.display = 'none';
});
document.querySelector('#updateDisable').addEventListener('click', () => {
    document.querySelector('.modal_update').style.display = 'none';
    document.querySelector('#update').style.display = 'none';
    localStorage.setItem('disabledVersion', `v${document.querySelector('#newVer').innerText}`);
});

document.querySelector('#app_max').addEventListener('click', windowControl.maximize);
document.querySelector('#app_min').addEventListener('click', windowControl.minimize);
document.querySelector('#app_close').addEventListener('click', windowControl.close);
window.setTimeout(init.completed, 5);
