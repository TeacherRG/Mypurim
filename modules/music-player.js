// ===== MUSIC PLAYER =====

var mpTracks = [];
var mpIndex = 0;
var mpAudio = new Audio();
var mpPlaying = false;

function initMusicPlayer() {
    fetch('tracks.json')
        .then(function (r) { return r.json(); })
        .then(function (tracks) {
            mpTracks = tracks;
            if (!mpTracks.length) return;
            mpLoad(0);
            bindMpEvents();
        })
        .catch(function (e) { AppLogger.warn('music-player: tracks.json load failed', e); });
}

function mpLoad(index) {
    mpIndex = index;
    var track = mpTracks[mpIndex];
    mpAudio.src = track.url;
    document.getElementById('mp-title').textContent = '\u266a ' + track.title;
    document.getElementById('mp-bar-fill').style.width = '0%';
    if (mpPlaying) { mpAudio.play(); }
}

function bindMpEvents() {
    var btnPlay = document.getElementById('mp-play');
    var btnPrev = document.getElementById('mp-prev');
    var btnNext = document.getElementById('mp-next');
    var bar     = document.getElementById('mp-bar');

    btnPlay.addEventListener('click', function () {
        if (mpPlaying) {
            mpAudio.pause();
            mpPlaying = false;
            btnPlay.textContent = '\u25b6';
        } else {
            mpAudio.play();
            mpPlaying = true;
            btnPlay.textContent = '\u23f8';
        }
    });

    btnPrev.addEventListener('click', function () {
        mpLoad((mpIndex - 1 + mpTracks.length) % mpTracks.length);
    });

    btnNext.addEventListener('click', function () {
        mpLoad((mpIndex + 1) % mpTracks.length);
    });

    mpAudio.addEventListener('timeupdate', function () {
        if (mpAudio.duration) {
            var pct = (mpAudio.currentTime / mpAudio.duration) * 100;
            document.getElementById('mp-bar-fill').style.width = pct + '%';
        }
    });

    mpAudio.addEventListener('ended', function () {
        mpPlaying = true;
        mpLoad((mpIndex + 1) % mpTracks.length);
        mpAudio.play();
    });

    bar.addEventListener('click', function (e) {
        if (!mpAudio.duration) return;
        var rect = bar.getBoundingClientRect();
        mpAudio.currentTime = ((e.clientX - rect.left) / rect.width) * mpAudio.duration;
    });
}
