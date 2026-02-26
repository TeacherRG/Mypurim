// ===== ESTHER SCROLL =====

function getEstherPDFs() {
    if (langMode === 'ru-de') {
        return [
            { file: 'pdfs/esther-ru-de-1.pdf', label: I18N.t('estherPart1', langMode) },
            { file: 'pdfs/esther-ru-de-2.pdf', label: I18N.t('estherPart2', langMode) }
        ];
    }
    if (langMode === 'ru-uk') {
        return [
            { file: 'pdfs/esther-ru-uk-1.pdf', label: I18N.t('estherPart1', langMode) },
            { file: 'pdfs/esther-ru-uk-2.pdf', label: I18N.t('estherPart2', langMode) }
        ];
    }
    if (langMode === 'uk') {
        return [];
    }
    if (langMode === 'de') {
        return [
            { file: 'pdfs/esther-de.pdf', label: '' }
        ];
    }
    if (langMode === 'he') {
        return [
            { file: 'pdfs/esther-he.pdf', label: '' }
        ];
    }
    // Default: Russian
    return [
        { file: 'pdfs/esther-ru.pdf', label: '' }
    ];
}

function getEstherJSONs() {
    if (langMode === 'ru-de') {
        return ['pdfs/ester-ru.json', 'pdfs/ester-de.json'];
    }
    if (langMode === 'ru-uk') {
        return ['pdfs/ester-ru.json', 'pdfs/ester-uk.json'];
    }
    if (langMode === 'uk') {
        return ['pdfs/ester-uk.json'];
    }
    if (langMode === 'de') {
        return ['pdfs/ester-de.json'];
    }
    if (langMode === 'he') {
        return ['pdfs/esther-he.json'];
    }
    return ['pdfs/ester-ru.json'];
}

// ===== HEBREW MEGILLA RENDERER =====
// Handles esther-he.json which uses chapters/verses structure (unlike other languages)
function renderHebrewMegilla(data, container) {
    container.setAttribute('dir', 'rtl');
    container.classList.add('esther-he-container');

    data.chapters.forEach(function (chapter) {
        var h = document.createElement('h3');
        h.className = 'esther-he-chapter';
        h.textContent = 'פרק ' + chapter.chapter_id;
        container.appendChild(h);

        chapter.verses.forEach(function (verse) {
            var p = document.createElement('p');
            p.className = 'esther-he-verse';

            // Verse number as superscript — appears at right side in RTL (start of verse)
            var num = document.createElement('sup');
            num.className = 'esther-he-verse-num';
            num.textContent = verse.verse_id;

            p.appendChild(num);
            p.appendChild(document.createTextNode('\u00A0' + verse.text));
            container.appendChild(p);
        });
    });
}

function renderEstherJSON(data, container) {
    // Hebrew format: chapters/verses — handled by dedicated renderer
    if (data.chapters) {
        renderHebrewMegilla(data, container);
        return;
    }
    // Pages/paragraphs format (ru, de, uk)
    data.pages.forEach(function (page) {
        if (page.headings && page.headings.length) {
            page.headings.forEach(function (h) {
                const el = document.createElement('h' + Math.min(h.level + 1, 6));
                el.className = 'esther-scroll-heading';
                el.textContent = h.text;
                container.appendChild(el);
            });
        }
        if (page.paragraphs && page.paragraphs.length) {
            page.paragraphs.forEach(function (text) {
                const p = document.createElement('p');
                p.className = 'esther-scroll-para';
                p.textContent = text;
                container.appendChild(p);
            });
        }
    });
}

function buildEstherPdfBlock(pdf) {
    const block = document.createElement('div');
    block.className = 'esther-pdf-block';

    if (pdf.label) {
        const label = document.createElement('h3');
        label.className = 'esther-pdf-label';
        label.textContent = pdf.label;
        block.appendChild(label);
    }

    const btnRow = document.createElement('div');
    btnRow.className = 'esther-btn-row';

    const openBtn = document.createElement('a');
    openBtn.href = pdf.file;
    openBtn.target = '_blank';
    openBtn.rel = 'noopener';
    openBtn.className = 'esther-btn esther-btn-open';
    openBtn.textContent = I18N.t('estherOpen', langMode);

    const downloadBtn = document.createElement('a');
    downloadBtn.href = pdf.file;
    downloadBtn.download = '';
    downloadBtn.className = 'esther-btn esther-btn-download';
    downloadBtn.textContent = I18N.t('estherDownload', langMode);

    btnRow.appendChild(openBtn);
    btnRow.appendChild(downloadBtn);
    block.appendChild(btnRow);

    return block;
}

function renderEstherScroll() {
    contentArea.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('esther_scroll', langMode);
    contentArea.appendChild(h2);

    // ── Megilla Audio Player ────────────────────────────────────────────────
    const audioPlayer = document.createElement('div');
    audioPlayer.className = 'megilla-audio-player';

    const audioTitle = document.createElement('p');
    audioTitle.className = 'megilla-audio-title';
    audioTitle.textContent = I18N.t('audioPlayerTitle', langMode);
    audioPlayer.appendChild(audioTitle);

    const audio = document.createElement('audio');
    audio.src = 'audio/megila.mp3';
    audio.preload = 'metadata';
    audioPlayer.appendChild(audio);

    const controls = document.createElement('div');
    controls.className = 'megilla-audio-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'megilla-audio-btn megilla-audio-btn-play';
    playBtn.textContent = I18N.t('audioPlay', langMode);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'megilla-audio-btn megilla-audio-btn-stop';
    stopBtn.textContent = I18N.t('audioStop', langMode);

    const speedLabel = document.createElement('span');
    speedLabel.className = 'megilla-audio-speed-label';
    speedLabel.textContent = I18N.t('audioSpeed', langMode);

    const speeds = [1, 1.25, 1.5, 2];
    const speedBtns = speeds.map(function (s) {
        const btn = document.createElement('button');
        btn.className = 'megilla-audio-speed-btn' + (s === 1 ? ' active' : '');
        btn.textContent = s === 1 ? '1×' : s + '×';
        btn.dataset.speed = s;
        btn.addEventListener('click', function () {
            audio.playbackRate = s;
            speedBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
        });
        return btn;
    });

    controls.appendChild(playBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(speedLabel);
    speedBtns.forEach(function (b) { controls.appendChild(b); });
    audioPlayer.appendChild(controls);

    const progressWrap = document.createElement('div');
    progressWrap.className = 'megilla-audio-progress-wrap';

    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.className = 'megilla-audio-progress';
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.step = 0.1;

    const timeEl = document.createElement('span');
    timeEl.className = 'megilla-audio-time';
    timeEl.textContent = '0:00 / 0:00';

    progressWrap.appendChild(progressBar);
    progressWrap.appendChild(timeEl);
    audioPlayer.appendChild(progressWrap);

    function formatTime(sec) {
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    audio.addEventListener('timeupdate', function () {
        if (!audio.duration) return;
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', function () {
        timeEl.textContent = '0:00 / ' + formatTime(audio.duration);
    });

    audio.addEventListener('ended', function () {
        playBtn.textContent = I18N.t('audioPlay', langMode);
        progressBar.value = 0;
    });

    progressBar.addEventListener('input', function () {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });

    playBtn.addEventListener('click', function () {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = I18N.t('audioPause', langMode);
        } else {
            audio.pause();
            playBtn.textContent = I18N.t('audioPlay', langMode);
        }
    });

    stopBtn.addEventListener('click', function () {
        audio.pause();
        audio.currentTime = 0;
        progressBar.value = 0;
        playBtn.textContent = I18N.t('audioPlay', langMode);
    });

    // Stop audio when leaving the section
    contentArea.addEventListener('maharash-cleanup', function () {
        audio.pause();
        audio.currentTime = 0;
    }, { once: true });

    contentArea.appendChild(audioPlayer);
    // ── End Audio Player ───────────────────────────────────────────────────

    const desc = document.createElement('p');
    desc.className = 'esther-desc';
    desc.textContent = I18N.t('estherDesc', langMode);
    contentArea.appendChild(desc);

    // ── Zoom toolbar ──────────────────────────────────────────────────────────
    var estherZoom = 1.0;
    var estherContainers = [];

    const zoomBar = document.createElement('div');
    zoomBar.className = 'esther-zoom-bar';

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'esther-zoom-btn';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.title = I18N.t('zoomOut', langMode);
    zoomOutBtn.disabled = true;

    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'esther-zoom-label';
    zoomLabel.textContent = '100%';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'esther-zoom-btn';
    zoomInBtn.textContent = '+';
    zoomInBtn.title = I18N.t('zoomIn', langMode);

    zoomBar.appendChild(zoomOutBtn);
    zoomBar.appendChild(zoomLabel);
    zoomBar.appendChild(zoomInBtn);
    contentArea.appendChild(zoomBar);

    function applyEstherZoom() {
        estherContainers.forEach(function (c) {
            c.style.fontSize = Math.round(estherZoom * 100) + '%';
        });
        zoomLabel.textContent = Math.round(estherZoom * 100) + '%';
        zoomInBtn.disabled = estherZoom >= 2.0;
        zoomOutBtn.disabled = estherZoom <= 0.5;
    }

    zoomOutBtn.addEventListener('click', function () {
        estherZoom = Math.max(0.5, parseFloat((estherZoom - 0.1).toFixed(1)));
        applyEstherZoom();
    });
    zoomInBtn.addEventListener('click', function () {
        estherZoom = Math.min(2.0, parseFloat((estherZoom + 0.1).toFixed(1)));
        applyEstherZoom();
    });
    // ── End Zoom toolbar ──────────────────────────────────────────────────────

    const pdfs = getEstherPDFs();
    const jsonFiles = getEstherJSONs();

    if (jsonFiles.length === 1) {
        pdfs.forEach(function (pdf) {
            contentArea.appendChild(buildEstherPdfBlock(pdf));
        });
        const container = document.createElement('div');
        container.className = 'esther-text-container';
        contentArea.appendChild(container);
        estherContainers.push(container);
        fetch(jsonFiles[0])
            .then(function (r) {
                if (!r.ok) throw new Error('not found');
                return r.json();
            })
            .then(function (data) { renderEstherJSON(data, container); })
            .catch(function (e) { AppLogger.error('esther-scroll: failed to load ' + jsonFiles[0], e); });
    } else {
        const dual = document.createElement('div');
        dual.className = 'esther-dual-container';
        contentArea.appendChild(dual);
        jsonFiles.forEach(function (file, i) {
            const col = document.createElement('div');
            col.className = 'esther-col-wrapper';
            dual.appendChild(col);
            const pdfBlock = buildEstherPdfBlock({ file: pdfs[i].file, label: '' });
            pdfBlock.classList.add('esther-pdf-block--compact');
            col.appendChild(pdfBlock);
            const textContainer = document.createElement('div');
            textContainer.className = 'esther-text-container esther-text-col';
            col.appendChild(textContainer);
            estherContainers.push(textContainer);
            fetch(file)
                .then(function (r) { return r.json(); })
                .then(function (data) { renderEstherJSON(data, textContainer); })
                .catch(function (e) { AppLogger.error('esther-scroll: failed to load dual ' + file, e); });
        });
    }

    // ── Mouse wheel zoom (Ctrl+wheel) on text containers ─────────────────────
    function onEstherWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            var delta = e.deltaY < 0 ? 0.1 : -0.1;
            estherZoom = Math.max(0.5, Math.min(2.0, parseFloat((estherZoom + delta).toFixed(1))));
            applyEstherZoom();
        }
    }

    estherContainers.forEach(function (c) {
        c.addEventListener('wheel', onEstherWheel, { passive: false });
    });

    contentArea.addEventListener('maharash-cleanup', function () {
        estherContainers.forEach(function (c) {
            c.removeEventListener('wheel', onEstherWheel);
        });
    }, { once: true });
    // ── End Mouse wheel zoom ──────────────────────────────────────────────────
}
