// ===== MEGILLA LISTEN =====
// Renders Hebrew Megilla text and listens via microphone,
// highlighting words as they are read aloud and auto-scrolling.

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

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'ml-btn ml-btn-download';
    downloadBtn.id = 'ml-download-btn';
    downloadBtn.innerHTML = I18N.t('mlDownload', langMode);

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

    controls.appendChild(downloadBtn);
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
    // verseList: flat array of { id, text } for verse-level sync
    var wordList = [];
    var globalWordIdx = 0;
    var verseList = [];
    var globalVerseIdx = 0;

    data.chapters.forEach(function (chapter) {
        // Chapter header
        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'ml-chapter-header';
        chapterHeader.textContent = I18N.t('mlChapter', langMode) + ' ' + chapter.chapter_id;
        textContainer.appendChild(chapterHeader);

        chapter.verses.forEach(function (verse) {
            const verseLine = document.createElement('div');
            verseLine.className = 'ml-verse';
            var verseElemId = 'ml-verse-' + globalVerseIdx;
            verseLine.id = verseElemId;
            verseList.push({ id: verseElemId, text: verse.text });
            globalVerseIdx++;

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
    var currentVerseIndex = 0;
    var highlightedEl = null;
    var highlightedVerseEl = null;

    // ── Hebrew normalization ───────────────────────────────────────────────
    // Strip niqqud (vowel marks U+05B0–U+05C7) for comparison
    function normalizeHeb(str) {
        return str
            .replace(/[\u05B0-\u05C7\u05F0-\u05F4\u05C0\u05C3\u05C6]/g, '')
            .replace(/[^\u05D0-\u05EA]/g, '')
            .trim();
    }

    // ── stripNikud ─────────────────────────────────────────────────────────
    // Strip Hebrew nikud (vowel points), cantillation marks, punctuation and
    // extra whitespace to produce a clean consonantal string for comparison.
    function stripNikud(text) {
        return text
            .replace(/[\u0591-\u05C7]/g, '')  // nikud + cantillation (U+0591–U+05C7)
            .replace(/[^\u05D0-\u05EA\s]/g, '') // keep only Hebrew letters and spaces
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ── Levenshtein distance ───────────────────────────────────────────────
    function levenshtein(a, b) {
        var m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        var prev = [], curr = [];
        for (var j = 0; j <= n; j++) prev[j] = j;
        for (var i = 1; i <= m; i++) {
            curr[0] = i;
            for (var j = 1; j <= n; j++) {
                curr[j] = a[i - 1] === b[j - 1]
                    ? prev[j - 1]
                    : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
            }
            var tmp = prev; prev = curr; curr = tmp;
        }
        return prev[n];
    }

    // ── scrollToVerse ──────────────────────────────────────────────────────
    // Highlight the verse element with the given id and scroll it into view.
    function scrollToVerse(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (highlightedVerseEl) highlightedVerseEl.classList.remove('ml-verse-active');
        el.classList.add('ml-verse-active');
        highlightedVerseEl = el;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── syncMegillah ───────────────────────────────────────────────────────
    // Match recognizedText against a sliding window of verses around
    // currentVerseIndex using Levenshtein similarity.  When the best match
    // exceeds the 60 % threshold, advance currentVerseIndex and highlight
    // the matched verse via scrollToVerse().
    var VERSE_WINDOW = 5; // look ±5 verses from current position
    var MATCH_THRESHOLD = 0.6;

    function syncMegillah(recognizedText) {
        var norm = stripNikud(recognizedText).replace(/\s/g, '');
        if (!norm) return;

        var start = Math.max(0, currentVerseIndex - VERSE_WINDOW);
        var end = Math.min(verseList.length - 1, currentVerseIndex + VERSE_WINDOW);

        var bestIdx = -1;
        var bestScore = 0;

        for (var i = start; i <= end; i++) {
            var verseNorm = stripNikud(verseList[i].text).replace(/\s/g, '');
            var maxLen = Math.max(norm.length, verseNorm.length);
            if (maxLen === 0) continue;
            var dist = levenshtein(norm, verseNorm);
            var score = 1 - dist / maxLen;
            if (score > bestScore) {
                bestScore = score;
                bestIdx = i;
            }
        }

        if (bestIdx >= 0 && bestScore >= MATCH_THRESHOLD) {
            currentVerseIndex = bestIdx;
            scrollToVerse(verseList[bestIdx].id);
        }
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
        for (var i = currentWordIdx; i < Math.min(currentWordIdx + LOOKAHEAD, wordList.length); i++) {
            var wn = normalizeHeb(wordList[i].text);
            if (wn && (wn.startsWith(norm) || norm.startsWith(wn))) return i;
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

    // ── Speech Recognition via HebrewSpeech / Whisper ─────────────────────

    function startListening() {
        if (!HebrewSpeech.ready()) {
            statusEl.textContent = I18N.t('mlModuleNotReady', langMode);
            statusEl.className = 'ml-status ml-status-error';
            return;
        }

        listenBtn.hidden = true;
        stopBtn.hidden = false;
        statusEl.textContent = I18N.t('mlListening', langMode);
        statusEl.className = 'ml-status ml-status-active';

        HebrewSpeech.start({
            onStatusChange: function (status) {
                if (status === 'mic-denied') {
                    statusEl.textContent = I18N.t('mlMicDenied', langMode);
                    statusEl.className = 'ml-status ml-status-error';
                    stopListening();
                } else if (status === 'error') {
                    statusEl.textContent = I18N.t('mlError', langMode);
                    statusEl.className = 'ml-status ml-status-error';
                    stopListening();
                }
            },
            onTranscript: function (text) {
                processTranscript(text);
                syncMegillah(text);
            }
        });
    }

    function stopListening() {
        HebrewSpeech.stop();
        listenBtn.hidden = false;
        stopBtn.hidden = true;
        statusEl.textContent = '';
        statusEl.className = 'ml-status';
    }

    // ── Download speech recognition module ────────────────────────────────
    var moduleDownloading = false;

    function downloadModule() {
        if (moduleDownloading || HebrewSpeech.ready()) return;
        moduleDownloading = true;
        downloadBtn.disabled = true;
        statusEl.textContent = I18N.t('mlDownloading', langMode);
        statusEl.className = 'ml-status ml-status-active';

        HebrewSpeech.load(function (status) {
            if (status === 'ready') {
                statusEl.textContent = I18N.t('mlDownloadReady', langMode);
                statusEl.className = 'ml-status ml-status-ready';
                downloadBtn.innerHTML = '✅ ' + I18N.t('mlDownloadReady', langMode);
            } else if (status === 'loading') {
                statusEl.textContent = I18N.t('mlDownloading', langMode);
                statusEl.className = 'ml-status ml-status-active';
            } else if (status === 'error') {
                AppLogger.error('megilla-listen: module load error');
                statusEl.textContent = I18N.t('mlDownloadError', langMode);
                statusEl.className = 'ml-status ml-status-error';
                downloadBtn.disabled = false;
                moduleDownloading = false;
            }
        });
    }

    // ── Button events ──────────────────────────────────────────────────────
    downloadBtn.addEventListener('click', downloadModule);
    listenBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);

    // ── Auto-load if model is already cached in browser Cache Storage ──────
    // Cache location: DevTools → Application → Cache Storage → transformers-cache
    // Model key: URLs containing "Xenova/whisper-tiny"
    HebrewSpeech.cached().then(function (isCached) {
        if (isCached && !moduleDownloading && !HebrewSpeech.ready()) {
            downloadModule();
        }
    }).catch(function (e) {
        AppLogger.warn('megilla-listen: cache check failed', e);
    });

    // ── Cleanup on section change ──────────────────────────────────────────
    contentArea.addEventListener('maharash-cleanup', function onCleanup() {
        stopListening();
        HebrewSpeech.terminate();
        contentArea.removeEventListener('maharash-cleanup', onCleanup);
    }, { once: true });
}
