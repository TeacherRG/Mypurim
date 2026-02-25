// ===== MEGILLA LISTEN =====
// Renders Hebrew Megilla text and listens via microphone,
// highlighting words as they are read aloud and auto-scrolling.

async function renderMegillaListen() {
    contentArea.innerHTML = '';

    // ── Title bar ──────────────────────────────────────────────────────────
    const titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('megilla_listen', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    // ── Controls ───────────────────────────────────────────────────────────
    const controls = document.createElement('div');
    controls.className = 'ml-controls';

    const listenBtn = document.createElement('button');
    listenBtn.className = 'ml-btn ml-btn-start';
    listenBtn.id = 'ml-listen-btn';
    listenBtn.innerHTML = '🎤 ' + I18N.t('mlListen', langMode);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'ml-btn ml-btn-stop';
    stopBtn.id = 'ml-stop-btn';
    stopBtn.innerHTML = '⏹ ' + I18N.t('mlStop', langMode);
    stopBtn.hidden = true;

    const statusEl = document.createElement('span');
    statusEl.className = 'ml-status';
    statusEl.id = 'ml-status';

    controls.appendChild(listenBtn);
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
    // wordList: flat array of { text, element }
    var wordList = [];
    var globalWordIdx = 0;

    data.chapters.forEach(function (chapter) {
        // Chapter header
        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'ml-chapter-header';
        chapterHeader.textContent = I18N.t('mlChapter', langMode) + ' ' + chapter.chapter_id;
        textContainer.appendChild(chapterHeader);

        chapter.verses.forEach(function (verse) {
            const verseLine = document.createElement('div');
            verseLine.className = 'ml-verse';

            // Verse number
            const verseNum = document.createElement('sup');
            verseNum.className = 'ml-verse-num';
            verseNum.textContent = verse.verse_id;
            verseLine.appendChild(verseNum);

            // Split verse into words, wrap each in a span
            var words = verse.text.split(/\s+/).filter(function (w) { return w.length > 0; });
            words.forEach(function (word, i) {
                if (i > 0) {
                    verseLine.appendChild(document.createTextNode(' '));
                }
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
    var isListening = false;
    var recognition = null;
    var highlightedEl = null;

    // ── Hebrew normalization ───────────────────────────────────────────────
    // Strip niqqud (vowel marks U+05B0–U+05C7) for comparison
    function normalizeHeb(str) {
        return str
            .replace(/[\u05B0-\u05C7\u05F0-\u05F4\u05C0\u05C3\u05C6]/g, '')
            .replace(/[^\u05D0-\u05EA]/g, '')
            .trim();
    }

    // ── Word matching ──────────────────────────────────────────────────────
    // Look ahead up to LOOKAHEAD words from currentWordIdx for the best match.
    var LOOKAHEAD = 20;

    function findBestMatch(spokenWord) {
        var norm = normalizeHeb(spokenWord);
        if (!norm) return -1;

        // Exact match first
        for (var i = currentWordIdx; i < Math.min(currentWordIdx + LOOKAHEAD, wordList.length); i++) {
            if (normalizeHeb(wordList[i].text) === norm) return i;
        }
        // Prefix match
        for (var j = currentWordIdx; j < Math.min(currentWordIdx + LOOKAHEAD, wordList.length); j++) {
            var wn = normalizeHeb(wordList[j].text);
            if (wn && (wn.startsWith(norm) || norm.startsWith(wn))) return j;
        }
        return -1;
    }

    // ── Highlight & scroll ─────────────────────────────────────────────────
    function highlightWord(idx) {
        if (highlightedEl) {
            highlightedEl.classList.remove('ml-word-active');
        }
        var el = wordList[idx].element;
        el.classList.add('ml-word-active');
        highlightedEl = el;

        // Auto-scroll: keep word roughly centered in viewport
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── Process recognized text ────────────────────────────────────────────
    function processTranscript(transcript) {
        var words = transcript.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
        words.forEach(function (word) {
            var matchIdx = findBestMatch(word);
            if (matchIdx >= 0) {
                highlightWord(matchIdx);
                currentWordIdx = matchIdx + 1;
            }
        });
    }

    // ── Speech Recognition ─────────────────────────────────────────────────
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    function startListening() {
        if (!SpeechRecognition) {
            statusEl.textContent = I18N.t('mlNotSupported', langMode);
            statusEl.className = 'ml-status ml-status-error';
            return;
        }

        isListening = true;
        listenBtn.hidden = true;
        stopBtn.hidden = false;
        statusEl.textContent = I18N.t('mlListening', langMode);
        statusEl.className = 'ml-status ml-status-active';

        recognition = new SpeechRecognition();
        recognition.lang = 'he-IL';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        recognition.onresult = function (event) {
            // Process each new result
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var result = event.results[i];
                // Use all alternatives for better matching
                for (var a = 0; a < result.length; a++) {
                    processTranscript(result[a].transcript);
                }
            }
        };

        recognition.onerror = function (event) {
            if (event.error === 'not-allowed') {
                statusEl.textContent = I18N.t('mlMicDenied', langMode);
                statusEl.className = 'ml-status ml-status-error';
                stopListening();
            } else if (event.error === 'no-speech') {
                // Ignore — will restart automatically
            } else {
                AppLogger.warn('megilla-listen: recognition error', event.error);
            }
        };

        recognition.onend = function () {
            // Auto-restart if still in listening mode
            if (isListening) {
                try { recognition.start(); } catch (e) { /* ignore */ }
            }
        };

        try {
            recognition.start();
        } catch (e) {
            AppLogger.error('megilla-listen: cannot start recognition', e);
            statusEl.textContent = I18N.t('mlError', langMode);
            statusEl.className = 'ml-status ml-status-error';
            stopListening();
        }
    }

    function stopListening() {
        isListening = false;
        if (recognition) {
            recognition.onend = null;
            try { recognition.stop(); } catch (e) { /* ignore */ }
            recognition = null;
        }
        listenBtn.hidden = false;
        stopBtn.hidden = true;
        statusEl.textContent = '';
        statusEl.className = 'ml-status';
    }

    // ── Button events ──────────────────────────────────────────────────────
    listenBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);

    // ── Cleanup on section change ──────────────────────────────────────────
    contentArea.addEventListener('maharash-cleanup', function onCleanup() {
        stopListening();
        contentArea.removeEventListener('maharash-cleanup', onCleanup);
    }, { once: true });
}
