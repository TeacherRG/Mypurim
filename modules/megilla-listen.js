// ===== MEGILLA LISTEN =====
// Renders Hebrew Megilla text and auto-advances word highlighting at a
// comfortable reading pace.  Uses the Web Audio API to detect ambient noise
// (e.g. gragger / ra'ashan) and pauses the highlight while noise is loud,
// resuming automatically when quiet returns.
// Clicking any word jumps the highlight to that word.

async function renderMegillaListen() {
    contentArea.innerHTML = '';

    // ── Title bar ──────────────────────────────────────────────────────────
    const titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.textContent = I18N.sectionTitle('megilla_listen', langMode);
    contentArea.appendChild(titleBar);

    // ── Controls ───────────────────────────────────────────────────────────
    const controls = document.createElement('div');
    controls.className = 'ml-controls';

    const startBtn = document.createElement('button');
    startBtn.className = 'ml-btn ml-btn-start';
    startBtn.id = 'ml-listen-btn';
    startBtn.textContent = I18N.t('mlStart', langMode);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'ml-btn ml-btn-stop';
    stopBtn.id = 'ml-stop-btn';
    stopBtn.textContent = I18N.t('mlStop', langMode);
    stopBtn.hidden = true;

    const statusEl = document.createElement('span');
    statusEl.className = 'ml-status';
    statusEl.id = 'ml-status';

    controls.appendChild(startBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(statusEl);
    contentArea.appendChild(controls);

    // ── Text container ─────────────────────────────────────────────────────
    const textContainer = document.createElement('div');
    textContainer.className = 'ml-text-container';
    textContainer.id = 'ml-text';
    textContainer.dir = 'rtl';
    contentArea.appendChild(textContainer);

    // ── Load JSON ──────────────────────────────────────────────────────────
    let data;
    try {
        const resp = await fetch('pdfs/esther-he.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        data = await resp.json();
    } catch (e) {
        AppLogger.error('megilla-listen: failed to load esther-he.json', e);
        textContainer.textContent = 'Ошибка загрузки текста Мегилы.';
        return;
    }

    // ── Build word list & render text ──────────────────────────────────────
    var wordList = [];
    var globalWordIdx = 0;

    data.chapters.forEach(function (chapter) {
        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'ml-chapter-header';
        chapterHeader.textContent = I18N.t('mlChapter', langMode) + ' ' + chapter.chapter_id;
        textContainer.appendChild(chapterHeader);

        chapter.verses.forEach(function (verse) {
            const verseLine = document.createElement('div');
            verseLine.className = 'ml-verse';

            const verseNum = document.createElement('sup');
            verseNum.className = 'ml-verse-num';
            verseNum.textContent = verse.verse_id;
            verseLine.appendChild(verseNum);

            var words = verse.text.split(/\s+/).filter(function (w) { return w.length > 0; });
            words.forEach(function (word, i) {
                if (i > 0) verseLine.appendChild(document.createTextNode(' '));
                var span = document.createElement('span');
                span.className = 'ml-word';
                span.dataset.idx = globalWordIdx;
                span.textContent = word;
                verseLine.appendChild(span);
                wordList.push({ text: word, element: span });
                globalWordIdx++;
            });

            textContainer.appendChild(verseLine);
        });
    });

    // ── State ──────────────────────────────────────────────────────────────
    var currentWordIdx = 0;
    var highlightedEl = null;
    var isRunning = false;
    var isPausedByNoise = false;
    var autoTimer = null;

    // Reading speed: 110 WPM ≈ 545 ms per word
    var currentWpm = 110;
    var WORD_INTERVAL = Math.round(60000 / currentWpm);

    // ── Noise detection state ──────────────────────────────────────────────
    var audioCtx = null;
    var analyser = null;
    var micStream = null;
    var noiseDataBuffer = null;
    var noiseCheckInterval = null;
    var noiseResumeTimer = null;
    var NOISE_THRESHOLD = 0.05;   // RMS amplitude threshold
    var NOISE_RESUME_DELAY = 1200; // ms of quiet before resuming

    function startNoiseDetection() {
        // Microphone permission request removed; noise detection disabled.
    }

    function checkNoise() {
        if (!analyser || !noiseDataBuffer) return;
        analyser.getFloatTimeDomainData(noiseDataBuffer);
        var sum = 0;
        for (var i = 0; i < noiseDataBuffer.length; i++) {
            sum += noiseDataBuffer[i] * noiseDataBuffer[i];
        }
        var rms = Math.sqrt(sum / noiseDataBuffer.length);

        if (rms > NOISE_THRESHOLD) {
            clearTimeout(noiseResumeTimer);
            noiseResumeTimer = null;
            if (isRunning && !isPausedByNoise) pauseHighlight();
        } else if (isPausedByNoise) {
            if (!noiseResumeTimer) {
                noiseResumeTimer = setTimeout(function () {
                    noiseResumeTimer = null;
                    resumeHighlight();
                }, NOISE_RESUME_DELAY);
            }
        }
    }

    function stopNoiseDetection() {
        clearInterval(noiseCheckInterval);
        noiseCheckInterval = null;
        clearTimeout(noiseResumeTimer);
        noiseResumeTimer = null;
        if (micStream) {
            micStream.getTracks().forEach(function (t) { t.stop(); });
            micStream = null;
        }
        if (audioCtx) {
            audioCtx.close().catch(function (e) { AppLogger.warn('megilla-listen: AudioContext close failed', e); });
            audioCtx = null;
            analyser = null;
        }
    }

    // ── Auto-advance ───────────────────────────────────────────────────────
    function scheduleNext() {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(advanceWord, WORD_INTERVAL);
    }

    function advanceWord() {
        if (!isRunning || isPausedByNoise) return;
        if (currentWordIdx >= wordList.length) {
            showCongratulations();
            return;
        }
        highlightWord(currentWordIdx);
        currentWordIdx++;
        scheduleNext();
    }

    function pauseHighlight() {
        isPausedByNoise = true;
        clearTimeout(autoTimer);
        statusEl.textContent = I18N.t('mlNoisePaused', langMode);
        statusEl.className = 'ml-status ml-status-noise';
    }

    function resumeHighlight() {
        isPausedByNoise = false;
        statusEl.textContent = I18N.t('mlRunning', langMode);
        statusEl.className = 'ml-status ml-status-active';
        advanceWord();
    }

    // ── Highlight & scroll ─────────────────────────────────────────────────
    function highlightWord(idx) {
        if (highlightedEl) highlightedEl.classList.remove('ml-word-active');
        var el = wordList[idx].element;
        el.classList.add('ml-word-active');
        highlightedEl = el;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── Congratulations ────────────────────────────────────────────────────
    function showCongratulations() {
        isRunning = false;
        clearTimeout(autoTimer);
        stopNoiseDetection();

        startBtn.hidden = false;
        stopBtn.hidden = true;
        statusEl.textContent = '';
        statusEl.className = 'ml-status';

        var overlay = document.createElement('div');
        overlay.className = 'ml-congrats-overlay';
        var box = document.createElement('div');
        box.className = 'ml-congrats-box';

        var emoji = document.createElement('div');
        emoji.className = 'ml-congrats-emoji';
        emoji.textContent = '🎉';

        var msg = document.createElement('div');
        msg.className = 'ml-congrats-text';
        msg.textContent = I18N.t('mlCongratulations', langMode);

        var closeBtn = document.createElement('button');
        closeBtn.className = 'ml-btn ml-btn-start';
        closeBtn.textContent = '✓ OK';
        closeBtn.addEventListener('click', function () {
            overlay.remove();
            currentWordIdx = 0;
            if (highlightedEl) {
                highlightedEl.classList.remove('ml-word-active');
                highlightedEl = null;
            }
        });

        box.appendChild(emoji);
        box.appendChild(msg);
        box.appendChild(closeBtn);
        overlay.appendChild(box);
        contentArea.appendChild(overlay);
    }

    // ── Click any word to jump ─────────────────────────────────────────────
    textContainer.addEventListener('click', function (e) {
        var target = e.target;
        if (!target.classList.contains('ml-word')) return;
        var idx = parseInt(target.dataset.idx, 10);
        if (isNaN(idx)) return;
        highlightWord(idx);
        currentWordIdx = idx + 1;
        if (!isRunning) {
            // Start reading from clicked word: set up state then schedule next advance
            isRunning = true;
            isPausedByNoise = false;
            startBtn.hidden = true;
            stopBtn.hidden = false;
            statusEl.textContent = I18N.t('mlRunning', langMode);
            statusEl.className = 'ml-status ml-status-active';
            startNoiseDetection();
            scheduleNext();
        } else {
            // Already running: jump to clicked word and reschedule
            clearTimeout(autoTimer);
            clearTimeout(noiseResumeTimer);
            noiseResumeTimer = null;
            isPausedByNoise = false;
            statusEl.textContent = I18N.t('mlRunning', langMode);
            statusEl.className = 'ml-status ml-status-active';
            scheduleNext();
        }
    });

    // ── Start / Stop ───────────────────────────────────────────────────────
    function startReading() {
        if (isRunning) return;
        isRunning = true;
        isPausedByNoise = false;
        startBtn.hidden = true;
        stopBtn.hidden = false;
        statusEl.textContent = I18N.t('mlRunning', langMode);
        statusEl.className = 'ml-status ml-status-active';
        startNoiseDetection();
        advanceWord();
    }

    function stopReading() {
        isRunning = false;
        isPausedByNoise = false;
        clearTimeout(autoTimer);
        stopNoiseDetection();
        startBtn.hidden = false;
        stopBtn.hidden = true;
        statusEl.textContent = '';
        statusEl.className = 'ml-status';
    }

    // ── Button events ──────────────────────────────────────────────────────
    startBtn.addEventListener('click', startReading);
    stopBtn.addEventListener('click', stopReading);

    // ── Floating bottom bar ─────────────────────────────────────────────────
    var fabBar = document.createElement('div');
    fabBar.className = 'ml-fab-bar';

    // Rattle button with long-press sound-selection menu
    var rattleSoundList = [
        { file: 'audio/Shum/' + encodeURIComponent('Гудок игрушечного паровоза.mp3'),        emoji: '🚂', label: { ru: 'Паровозик', uk: 'Паровозик', de: 'Lokomotive', en: 'Train',   he: 'קטר' } },
        { file: 'audio/Shum/' + encodeURIComponent('Игрушка-шумелка_ крутящаяся шумелка металлическая.mp3'), emoji: '🎉', label: { ru: 'Шумелка',   uk: 'Шумілка',   de: 'Rassel',    en: 'Rattle',  he: 'רעשן' } },
        { file: 'audio/Shum/' + encodeURIComponent('Игрушки_ много детских игрушек-шумелок, гудят и пищат.mp3'), emoji: '🧸', label: { ru: 'Игрушки',   uk: 'Іграшки',   de: 'Spielzeug', en: 'Toys',    he: 'צעצועים' } },
        { file: 'audio/Shum/' + encodeURIComponent('Шумящая игрушка.wav'),                    emoji: '🪘', label: { ru: 'Гремелка',  uk: 'Гриміт',    de: 'Klapper',   en: 'Gragger', he: 'פורימשפיל' } }
    ];
    var rattleSoundIdx = 3; // default: original sound (Шумящая игрушка.wav)
    var rattleAudio = new Audio(rattleSoundList[rattleSoundIdx].file);
    rattleAudio.loop = true;
    var rattlePlaying = false;

    var rattleWrap = document.createElement('div');
    rattleWrap.className = 'ml-rattle-wrap';

    var rattleBtn = document.createElement('button');
    rattleBtn.className = 'ml-fab-rattle';
    rattleBtn.title = I18N.t('mlRattleBtn', langMode);
    rattleBtn.textContent = rattleSoundList[rattleSoundIdx].emoji;

    var rattleMenuCloseListener = null;

    function openRattleMenu() {
        // Remove any existing outside-click listener before toggling
        if (rattleMenuCloseListener) {
            document.removeEventListener('click', rattleMenuCloseListener);
            rattleMenuCloseListener = null;
        }
        var existing = document.getElementById('ml-rattle-menu');
        if (existing) { existing.remove(); return; }
        var uiLang = ['uk', 'de', 'he', 'en'].indexOf(langMode) !== -1 ? langMode : 'ru';
        var menu = document.createElement('div');
        menu.id = 'ml-rattle-menu';
        menu.className = 'ml-rattle-menu';
        rattleSoundList.forEach(function (snd, i) {
            var item = document.createElement('button');
            item.className = 'ml-rattle-menu-item' + (i === rattleSoundIdx ? ' ml-rattle-menu-item-active' : '');
            item.textContent = snd.emoji + ' ' + (snd.label[uiLang] || snd.label.ru);
            item.addEventListener('click', function (ev) {
                ev.stopPropagation();
                if (rattleMenuCloseListener) {
                    document.removeEventListener('click', rattleMenuCloseListener);
                    rattleMenuCloseListener = null;
                }
                if (i !== rattleSoundIdx) {
                    if (rattlePlaying) {
                        rattleAudio.pause();
                        rattleAudio.currentTime = 0;
                    }
                    var oldAudio = rattleAudio;
                    rattleSoundIdx = i;
                    rattleAudio = new Audio(rattleSoundList[rattleSoundIdx].file);
                    rattleAudio.loop = true;
                    rattleBtn.textContent = rattleSoundList[rattleSoundIdx].emoji;
                    oldAudio.src = '';
                    if (rattlePlaying) {
                        var p = rattleAudio.play();
                        if (p) p.catch(function (e) { AppLogger.warn('megilla-listen: rattle audio blocked', e); });
                    }
                }
                menu.remove();
            });
            menu.appendChild(item);
        });
        rattleWrap.appendChild(menu);
        setTimeout(function () {
            rattleMenuCloseListener = function (ev) {
                if (!rattleWrap.contains(ev.target)) {
                    menu.remove();
                    document.removeEventListener('click', rattleMenuCloseListener);
                    rattleMenuCloseListener = null;
                }
            };
            document.addEventListener('click', rattleMenuCloseListener);
        }, 0);
    }

    var rattlePressTimer = null;
    var rattleLongPressed = false;

    function startRattlePress() {
        rattleLongPressed = false;
        rattlePressTimer = setTimeout(function () {
            rattleLongPressed = true;
            openRattleMenu();
        }, 500);
    }

    function cancelRattlePress() {
        clearTimeout(rattlePressTimer);
        rattlePressTimer = null;
    }

    rattleBtn.addEventListener('mousedown', startRattlePress);
    rattleBtn.addEventListener('touchstart', startRattlePress, { passive: true });
    rattleBtn.addEventListener('mouseup', cancelRattlePress);
    rattleBtn.addEventListener('mouseleave', cancelRattlePress);
    rattleBtn.addEventListener('touchend', cancelRattlePress);
    rattleBtn.addEventListener('touchcancel', cancelRattlePress);

    rattleBtn.addEventListener('click', function () {
        if (rattleLongPressed) { rattleLongPressed = false; return; }
        if (rattlePlaying) {
            rattleAudio.pause();
            rattleAudio.currentTime = 0;
            rattlePlaying = false;
            rattleBtn.classList.remove('ml-fab-rattle-active');
        } else {
            rattleAudio.currentTime = 0;
            var p = rattleAudio.play();
            if (p) p.catch(function (e) { AppLogger.warn('megilla-listen: rattle audio blocked', e); });
            rattlePlaying = true;
            rattleBtn.classList.add('ml-fab-rattle-active');
        }
    });

    rattleWrap.appendChild(rattleBtn);

    // Small help button (?) next to rattle
    function showHelpPopup() {
        var overlay = document.createElement('div');
        overlay.className = 'ml-help-overlay';
        var box = document.createElement('div');
        box.className = 'ml-help-box';
        var titleEl = document.createElement('div');
        titleEl.className = 'ml-help-title';
        titleEl.textContent = I18N.t('mlHelpTitle', langMode);
        var content = document.createElement('div');
        content.className = 'ml-help-content';
        content.textContent = I18N.t('mlHelpPopup', langMode);
        var closeBtn = document.createElement('button');
        closeBtn.className = 'ml-help-close';
        closeBtn.textContent = '✓ OK';
        closeBtn.addEventListener('click', function () { overlay.remove(); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
        box.appendChild(titleEl);
        box.appendChild(content);
        box.appendChild(closeBtn);
        overlay.appendChild(box);
        contentArea.appendChild(overlay);
    }

    var helpBtn = document.createElement('button');
    helpBtn.className = 'ml-help-btn';
    helpBtn.title = I18N.t('mlHelpBtn', langMode);
    helpBtn.textContent = '?';
    helpBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        showHelpPopup();
    });
    rattleWrap.appendChild(helpBtn);

    fabBar.appendChild(rattleWrap);

    // Speed control: slower (▼) / label / faster (▲)
    var slowerBtn = document.createElement('button');
    slowerBtn.className = 'ml-fab-speed-btn';
    slowerBtn.title = I18N.t('mlSpeedDown', langMode);
    slowerBtn.textContent = '▼';

    var speedValueEl = document.createElement('span');
    speedValueEl.className = 'ml-fab-speed-value';

    var fasterBtn = document.createElement('button');
    fasterBtn.className = 'ml-fab-speed-btn';
    fasterBtn.title = I18N.t('mlSpeedUp', langMode);
    fasterBtn.textContent = '▲';

    function updateSpeedLabel() {
        speedValueEl.textContent = currentWpm + ' wpm';
    }
    updateSpeedLabel();

    slowerBtn.addEventListener('click', function () {
        if (currentWpm > 50) {
            currentWpm -= 10;
            WORD_INTERVAL = Math.round(60000 / currentWpm);
            updateSpeedLabel();
        }
    });

    fasterBtn.addEventListener('click', function () {
        if (currentWpm < 300) {
            currentWpm += 10;
            WORD_INTERVAL = Math.round(60000 / currentWpm);
            updateSpeedLabel();
        }
    });

    fabBar.appendChild(slowerBtn);
    fabBar.appendChild(speedValueEl);
    fabBar.appendChild(fasterBtn);

    // Font size control: slider
    var DEFAULT_FONT_SIZE = 22;
    var fontSizeLabel = document.createElement('span');
    fontSizeLabel.className = 'ml-fab-speed-label ml-font-size-label';
    fontSizeLabel.title = I18N.t('mlFontSize', langMode);
    fontSizeLabel.textContent = 'A';

    var fontSizeSlider = document.createElement('input');
    fontSizeSlider.type = 'range';
    fontSizeSlider.className = 'ml-font-slider';
    fontSizeSlider.min = 14;
    fontSizeSlider.max = 40;
    fontSizeSlider.step = 1;
    fontSizeSlider.value = DEFAULT_FONT_SIZE;
    fontSizeSlider.title = I18N.t('mlFontSize', langMode);

    var fontSizeValueEl = document.createElement('span');
    fontSizeValueEl.className = 'ml-fab-speed-value';
    fontSizeValueEl.textContent = DEFAULT_FONT_SIZE + 'px';

    fontSizeSlider.addEventListener('input', function () {
        var size = parseInt(fontSizeSlider.value, 10);
        textContainer.style.fontSize = size + 'px';
        fontSizeValueEl.textContent = size + 'px';
    });

    fabBar.appendChild(fontSizeLabel);
    fabBar.appendChild(fontSizeSlider);
    fabBar.appendChild(fontSizeValueEl);

    contentArea.appendChild(fabBar);

    // Stop rattle when leaving the section
    contentArea.addEventListener('maharash-cleanup', function onFabCleanup() {
        stopReading();
        if (rattlePlaying) {
            rattleAudio.pause();
            rattleAudio.currentTime = 0;
            rattlePlaying = false;
        }
        if (rattleMenuCloseListener) {
            document.removeEventListener('click', rattleMenuCloseListener);
            rattleMenuCloseListener = null;
        }
        var existingMenu = document.getElementById('ml-rattle-menu');
        if (existingMenu) existingMenu.remove();
        fabBar.remove();
        contentArea.removeEventListener('maharash-cleanup', onFabCleanup);
    }, { once: true });
}
