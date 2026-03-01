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

    // ── Help popup ─────────────────────────────────────────────────────────
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

    // ── Help button (top bar) ──────────────────────────────────────────────
    var ctrlHelpBtn = document.createElement('button');
    ctrlHelpBtn.className = 'ml-ctrl-help-btn';
    ctrlHelpBtn.title = I18N.t('mlHelpBtn', langMode);
    ctrlHelpBtn.textContent = '?';
    ctrlHelpBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        showHelpPopup();
    });

    // ── Settings button with dropdown (top bar) ────────────────────────────
    var DEFAULT_FONT_SIZE = 22;

    var settingsWrap = document.createElement('div');
    settingsWrap.className = 'ml-settings-wrap';

    var settingsBtn = document.createElement('button');
    settingsBtn.className = 'ml-ctrl-settings-btn';
    settingsBtn.title = I18N.t('mlSettingsBtn', langMode);
    settingsBtn.textContent = '⚙';

    var settingsPanel = document.createElement('div');
    settingsPanel.className = 'ml-settings-panel';
    settingsPanel.hidden = true;

    // Font family row
    var fontFamilyRow = document.createElement('div');
    fontFamilyRow.className = 'ml-settings-row';
    var fontFamilyLbl = document.createElement('label');
    fontFamilyLbl.className = 'ml-settings-label';
    fontFamilyLbl.textContent = I18N.t('mlFontFamily', langMode);
    var fontFamilySelect = document.createElement('select');
    fontFamilySelect.className = 'ml-settings-select';
    var FONT_FAMILIES = [
        { value: "'Stam Ashkenaz CLM', 'Frank Ruhl Libre', serif", label: 'Stam Ashkenaz' },
        { value: "'Frank Ruhl Libre', serif",                        label: 'Frank Ruhl Libre' },
        { value: "'Times New Roman', serif",                          label: 'Times New Roman' },
        { value: 'Arial, sans-serif',                                 label: 'Arial' }
    ];
    FONT_FAMILIES.forEach(function (ff, i) {
        var opt = document.createElement('option');
        opt.value = ff.value;
        opt.textContent = ff.label;
        if (i === 0) opt.selected = true;
        fontFamilySelect.appendChild(opt);
    });
    fontFamilySelect.addEventListener('change', function () {
        textContainer.style.fontFamily = fontFamilySelect.value;
    });
    fontFamilyRow.appendChild(fontFamilyLbl);
    fontFamilyRow.appendChild(fontFamilySelect);

    // Font size row
    var fontSizeRow = document.createElement('div');
    fontSizeRow.className = 'ml-settings-row';
    var fontSizeLbl = document.createElement('label');
    fontSizeLbl.className = 'ml-settings-label';
    fontSizeLbl.textContent = I18N.t('mlFontSize', langMode);
    var fontSizeSlider = document.createElement('input');
    fontSizeSlider.type = 'range';
    fontSizeSlider.className = 'ml-font-slider';
    fontSizeSlider.min = 14;
    fontSizeSlider.max = 40;
    fontSizeSlider.step = 1;
    fontSizeSlider.value = DEFAULT_FONT_SIZE;
    var fontSizeValueEl = document.createElement('span');
    fontSizeValueEl.className = 'ml-settings-size-value';
    fontSizeValueEl.textContent = DEFAULT_FONT_SIZE + 'px';
    fontSizeSlider.addEventListener('input', function () {
        var size = parseInt(fontSizeSlider.value, 10);
        textContainer.style.fontSize = size + 'px';
        fontSizeValueEl.textContent = size + 'px';
    });
    fontSizeRow.appendChild(fontSizeLbl);
    fontSizeRow.appendChild(fontSizeSlider);
    fontSizeRow.appendChild(fontSizeValueEl);

    settingsPanel.appendChild(fontFamilyRow);
    settingsPanel.appendChild(fontSizeRow);
    settingsWrap.appendChild(settingsBtn);
    settingsWrap.appendChild(settingsPanel);

    var settingsPanelCloseListener = null;
    settingsBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        settingsPanel.hidden = !settingsPanel.hidden;
        if (!settingsPanel.hidden) {
            if (settingsPanelCloseListener) {
                document.removeEventListener('click', settingsPanelCloseListener);
            }
            settingsPanelCloseListener = function (ev) {
                if (!settingsWrap.contains(ev.target)) {
                    settingsPanel.hidden = true;
                    document.removeEventListener('click', settingsPanelCloseListener);
                    settingsPanelCloseListener = null;
                }
            };
            setTimeout(function () {
                document.addEventListener('click', settingsPanelCloseListener);
            }, 0);
        }
    });

    controls.appendChild(startBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(ctrlHelpBtn);
    controls.appendChild(settingsWrap);
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
    var specialVerseRanges = []; // [{verseKey, startIdx, endIdx}] for verses shown with transcription

    // Special verses that require a different background and phonetic transcription
    var SPECIAL_VERSES = {
        '2_ה': {
            ru: 'Иш йеґуди ґая бэ-Шушан ґа-бира, у-шмо Мордехай...',
            uk: 'Іш єґуді ґая бе-Шушан ґа-біра, у-шмо Мордехай...',
            de: 'Isch Jehudi haja be-Schushan ha-bira, u-schmo Mordechai...',
            en: 'Ish yehudi haya be-Shushan ha-bira, u-shmo Mordechai...'
        },
        '8_טו': {
            ru: 'У-Мордехай яца милифнэй ґа-мéлех...',
            uk: 'У-Мордехай яца мілефней ґа-мелех...',
            de: 'U-Mordechai jaza milifnej ha-melech...',
            en: 'U-Mordechai yatza milifnei ha-melech...'
        },
        '8_טז': {
            ru: 'Лайеґудим ґайта ора вэ-симха вэ-сасон вийкар',
            uk: 'Ла-єґудім ґайта ора ве-сімха ве-сасон вийкар',
            de: 'La-jehudim hajta ora we-simcha we-sason wijkar',
            en: 'La-yehudim hayta ora ve-simcha ve-sason vi-ykar'
        },
        '9_ו': {
            ru: 'У-вэ-Шушан ґа-бира аргу hайеґудим вэ-авэд хамéш мэот иш',
            uk: 'У-ве-Шушан ґа-біра аргу га-єґудім ве-авед хамеш меот іш',
            de: 'U-we-Schushan ha-bira hargu ha-jehudim we-awed chamesch me\'ot isch',
            en: 'U-ve-Shushan ha-bira hargu ha-yehudim ve-aved chamesh me\'ot ish'
        },
        '9_ז': {
            ru: 'Вэ-эт Паршандата, вэ-эт Далфон, вэ-эт Аспата',
            uk: 'Ве-ет Паршандата, ве-ет Далфон, ве-ет Аспата',
            de: 'We-et Parschandata, we-et Dalfon, we-et Aspata',
            en: 'Ve\'et Parshandata, ve\'et Dalfon, ve\'et Aspata'
        },
        '9_ח': {
            ru: 'Вэ-эт Пората, вэ-эт Адалья, вэ-эт Аридата',
            uk: 'Ве-ет Пората, ве-ет Адалья, ве-ет Аридата',
            de: 'We-et Porata, we-et Adalja, we-et Aridata',
            en: 'Ve\'et Porata, ve\'et Adalya, ve\'et Aridata'
        },
        '9_ט': {
            ru: 'Вэ-эт Пармашта, вэ-эт Арисай, вэ-эт Аридай, вэ-эт Вайзата',
            uk: 'Ве-ет Пармашта, ве-ет Арісай, ве-ет Арідай, ве-ет Вайзата',
            de: 'We-et Parmaschta, we-et Arisaj, we-et Aridaj, we-et Wajsata',
            en: 'Ve\'et Parmashta, ve\'et Arisai, ve\'et Aridai, ve\'et Vayzata'
        },
        '9_י': {
            ru: 'Эсэрет бнэй Аман бен-hа-Мэдата...',
            uk: 'Есерет бней Гаман бен-га-Медата...',
            de: 'Asseret bnei Haman ben-ha-Medata...',
            en: 'Aseret bnei Haman ben-ha-Medata...'
        },
        '10_ג': {
            ru: 'Ки Мордехай ґа-Йеґуди мишнэ ла-мéлех Ахашвэрóш вэ-гадóл лайеґудим вэ-рацуй лэ-рóв эхав, дорéш тов лэ-амо вэ-довэр шалóм лэхоль-заро',
            uk: 'Кі Мордехай ґа-Єґуді мішне ла-мелех Ахашверош ве-гадол ла-єґудім ве-рацуй ле-ров ехав, дореш тов ле-амо ве-довер шалом лехоль-заро',
            de: 'Ki Mordechai ha-Jehudi mischne la-melech Ahaschverosch we-gadol la-Jehudim we-razuj le-row echaw, doresch tow le-ammo we-dover schalom le-chol-saro',
            en: 'Ki Mordechai ha-Yehudi mishne la-melech Achashverosh ve-gadol la-Yehudim ve-ratsuy le-rov echav, doresh tov le-amo ve-dover shalom le-chol-zaro'
        }
    };
    var uiLang = { uk: 'uk', de: 'de', en: 'en' }[langMode] || 'ru';
    var showTranscription = (langMode !== 'he');

    data.chapters.forEach(function (chapter) {
        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'ml-chapter-header';
        chapterHeader.textContent = I18N.t('mlChapter', langMode) + ' ' + chapter.chapter_id;
        textContainer.appendChild(chapterHeader);

        chapter.verses.forEach(function (verse) {
            var verseKey = chapter.chapter_id + '_' + verse.verse_id;
            var specialData = SPECIAL_VERSES[verseKey];

            const verseLine = document.createElement('div');
            verseLine.className = 'ml-verse';

            const verseNum = document.createElement('sup');
            verseNum.className = 'ml-verse-num';
            verseNum.textContent = verse.verse_id;
            verseLine.appendChild(verseNum);

            var words = verse.text.split(/\s+/).filter(function (w) { return w.length > 0; });
            var verseWordStartIdx = globalWordIdx;
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

            if (specialData) {
                var wrapper = document.createElement('div');
                wrapper.className = 'ml-verse-special-wrapper';
                wrapper.appendChild(verseLine);
                if (showTranscription && specialData[uiLang]) {
                    specialVerseRanges.push({ verseKey: verseKey, startIdx: verseWordStartIdx, endIdx: globalWordIdx - 1, wrapper: wrapper });
                    var transcription = document.createElement('div');
                    transcription.className = 'ml-verse-transcription';
                    transcription.textContent = specialData[uiLang];
                    wrapper.appendChild(transcription);
                }
                textContainer.appendChild(wrapper);
            } else {
                textContainer.appendChild(verseLine);
            }
        });
    });

    // ── State ──────────────────────────────────────────────────────────────
    var currentWordIdx = 0;
    var highlightedEls = [];
    var isRunning = false;
    var isPausedByNoise = false;
    var autoTimer = null;
    var repeatedVerses = new Set(); // tracks which special verses have already been repeated

    // Reading speed: 110 WPM ≈ 545 ms per word; highlight advances 3 words at a time
    var currentWpm = 110;
    var WORD_INTERVAL = Math.round(60000 * 3 / currentWpm);

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
        var nextIdx = currentWordIdx + 3;
        // After covering a special verse's last words, repeat it once more
        for (var r = 0; r < specialVerseRanges.length; r++) {
            var range = specialVerseRanges[r];
            if (currentWordIdx <= range.endIdx && nextIdx > range.endIdx && !repeatedVerses.has(range.verseKey)) {
                repeatedVerses.add(range.verseKey);
                nextIdx = range.startIdx;
                break;
            }
        }
        currentWordIdx = nextIdx;
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
        highlightedEls.forEach(function (el) { el.classList.remove('ml-word-active'); });
        highlightedEls = [];
        for (var i = 0; i < 3; i++) {
            if (idx + i < wordList.length) {
                wordList[idx + i].element.classList.add('ml-word-active');
                highlightedEls.push(wordList[idx + i].element);
            }
        }
        specialVerseRanges.forEach(function (range) {
            if (idx >= range.startIdx && idx <= range.endIdx) {
                range.wrapper.classList.add('ml-verse-special-wrapper--active');
            } else {
                range.wrapper.classList.remove('ml-verse-special-wrapper--active');
            }
        });
        wordList[idx].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            repeatedVerses = new Set();
            highlightedEls.forEach(function (el) { el.classList.remove('ml-word-active'); });
            highlightedEls = [];
            specialVerseRanges.forEach(function (range) { range.wrapper.classList.remove('ml-verse-special-wrapper--active'); });
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
        currentWordIdx = idx + 3;
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
        repeatedVerses = new Set();
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
            WORD_INTERVAL = Math.round(60000 * 3 / currentWpm);
            updateSpeedLabel();
        }
    });

    fasterBtn.addEventListener('click', function () {
        if (currentWpm < 300) {
            currentWpm += 10;
            WORD_INTERVAL = Math.round(60000 * 3 / currentWpm);
            updateSpeedLabel();
        }
    });

    fabBar.appendChild(slowerBtn);
    fabBar.appendChild(speedValueEl);
    fabBar.appendChild(fasterBtn);

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
        if (settingsPanelCloseListener) {
            document.removeEventListener('click', settingsPanelCloseListener);
            settingsPanelCloseListener = null;
        }
        var existingMenu = document.getElementById('ml-rattle-menu');
        if (existingMenu) existingMenu.remove();
        fabBar.remove();
        contentArea.removeEventListener('maharash-cleanup', onFabCleanup);
    }, { once: true });
}
