// ===== MEGILLA LISTEN =====
// Renders Hebrew Megilla text and listens via microphone,
// highlighting words as they are read aloud and auto-scrolling.

// Inline fallback: chapter 1 of the Megillat Esther (used when JSON fetch fails)
var MEGILLA_HE_FALLBACK = {"chapters":[{"chapter_id":1,"verses":[{"verse_id":"א","text":"וַיְהִ֖י בִּימֵ֣י אֲחַשְׁוֵר֑וֹשׁ ה֣וּא אֲחַשְׁוֵר֗וֹשׁ הַמֹּלֵךְ֙ מֵהֹ֣דּוּ וְעַד-כּ֔וּשׁ שֶׁ֛בַע וְעֶשְׂרִ֥ים וּמֵאָ֖ה מְדִינָֽה:"},{"verse_id":"ב","text":"בַּיָּמִ֖ים הָהֵ֑ם כְּשֶׁ֣בֶת הַמֶּ֣לֶךְ אֲחַשְׁוֵר֗וֹשׁ עַ֚ל כִּסֵּ֣א מַלְכוּת֔וֹ אֲשֶׁ֖ר בְּשׁוּשַׁ֥ן הַבִּירָֽה:"},{"verse_id":"ג","text":"בִּשְׁנַ֤ת שָׁלוֹשׁ֙ לְמָלְכ֔וֹ עָשָׂ֣ה מִשְׁתֶּ֔ה לְכָל-שָׂרָ֖יו וַעֲבָדָ֑יו חֵ֣יל פָּרַ֣ס וּמָדַ֗י הַפַּרְתְּמִ֛ים וְשָׂרֵ֥י הַמְּדִינ֖וֹת לְפָנָֽיו:"},{"verse_id":"ד","text":"בְּהַרְאֹת֗וֹ אֶת-עֹ֙שֶׁר֙ כְּב֣וֹד מַלְכוּת֔וֹ וְאֶת-יְקָ֔ר תִּפְאֶ֖רֶת גְּדוּלָּ֑תוֹ יָמִ֣ים רַבִּ֔ים שְׁמוֹנִ֥ים וּמְאַ֖ת יֽוֹם:"},{"verse_id":"ה","text":"וּבִמְל֣וֹאת הַיָּמִ֣ים הָאֵ֗לֶּה עָשָׂ֣ה הַמֶּ֡לֶךְ לְכָל-הָעָ֣ם הַנִּמְצְאִים֩ בְּשׁוּשַׁ֨ן הַבִּירָ֜ה לְמִגָּ֧דוֹל וְעַד-קָטָ֛ן מִשְׁתֶּ֖ה שִׁבְעַ֣ת יָמִ֑ים בַּחֲצַ֕ר גִּנַּ֥ת בִּיתַ֖ן הַמֶּֽלֶךְ:"},{"verse_id":"ו","text":"ח֣וּר כַּרְפַּ֣ס וּתְכֵ֗לֶת אָחוּז֙ בְּחַבְלֵי-ב֣וּץ וְאַרְגָּמָ֔ן עַל-גְּלִ֥ילֵי כֶ֖סֶף וְעַמּ֣וּדֵי שֵׁ֑שׁ מִטּ֣וֹת זָהָ֣ב וָכֶ֗סֶף עַ֛ל רִֽצְפַ֥ת בַּהַט-וָשֵׁ֖שׁ וְדַ֥ר וְסֹחָֽרֶת:"},{"verse_id":"ז","text":"וְהַשְׁקוֹת֙ בִּכְלֵ֣י זָהָ֔ב וְכֵלִ֖ים מִכֵּלִ֣ים שׁוֹנִ֑ים וְיֵ֥ין מַלְכ֛וּת רָ֖ב כְּיַ֥ד הַמֶּֽלֶךְ:"},{"verse_id":"ח","text":"וְהַשְּׁתִיָּ֥ה כַדָּ֖ת אֵ֣ין אֹנֵ֑ס כִּי-כֵ֣ן יִסַּ֣ד הַמֶּ֗לֶךְ עַ֚ל כָּל-רַ֣ב בֵּית֔וֹ לַעֲשׂ֖וֹת כִּרְצ֥וֹן אִישׁ-וָאִֽישׁ:"},{"verse_id":"ט","text":"גַּ֚ם וַשְׁתִּ֣י הַמַּלְכָּ֔ה עָשְׂתָ֖ה מִשְׁתֶּ֣ה נָשִׁ֑ים בֵּ֚ית הַמַּלְכ֔וּת אֲשֶׁ֖ר לַמֶּ֥לֶךְ אֲחַשְׁוֵרֽוֹשׁ:"},{"verse_id":"י","text":"בַּיּוֹם֙ הַשְּׁבִיעִ֔י כְּט֥וֹב לֵב-הַמֶּ֖לֶךְ בַּיָּ֑יִן אָמַ֡ר לִמְהוּמָן בִּזְּתָ֨א חַרְבוֹנָ֜א בִּגְתָ֤א וַאֲבַגְתָא֙ זֵתַ֣ר וְכַרְכַּ֔ס שִׁבְעַת֙ הַסָּרִיסִ֔ים הַמְשָׁ֣רְתִ֔ים אֶת-פְּנֵ֖י הַמֶּ֥לֶךְ אֲחַשְׁוֵרֽוֹשׁ:"},{"verse_id":"יא","text":"לְהָבִיא אֶת-וַשְׁתִּ֧י הַמַּלְכָּ֛ה לִפְנֵ֥י הַמֶּ֖לֶךְ בְּכֶ֣תֶר מַלְכ֑וּת לְהַרְא֨וֹת הָעַמִּ֤ים וְהַשָּׂרִים֙ אֶת-יָפְיָ֔הּ כִּֽי-טוֹבַ֥ת מַרְאֶ֖ה הִֽיא:"},{"verse_id":"יב","text":"וַתְּמָאֵ֞ן הַמַּלְכָּ֣ה וַשְׁתִּ֗י לָבוֹא֙ בִּדְבַ֣ר הַמֶּ֔ךְ אֲשֶׁ֖ר בְּיַ֣ד הַסָּרִיסִ֑ים וַיִּקְצֹ֤ף הַמֶּ֙לֶךְ֙ מְאֹ֔ד וַחֲמָת֖וֹ בָּעֲרָ֥ה בֽוֹ:"},{"verse_id":"יג","text":"וַיֹּ֣אמֶר הַמֶּ֔לֶךְ לַחֲכָמִ֖ים יֹדְעֵ֣י הָעִתִּ֑ים כִּי-כֵן֙ דְּבַ֣ר הַמֶּ֔לֶךְ לִפְנֵ֕י כָּל-יֹדְעֵ֖י דָּ֥ת וָדִֽין:"},{"verse_id":"יד","text":"וְהַקָּרֹ֣ב אֵלָ֗יו כַּרְשְׁנָ֤א שֵׁתָר֙ אַדְמָ֣תָא תַרְשִׁ֔ישׁ מֶ֥רֶס מַרְסְנָ֖א מְמוּכָ֑ן שִׁבְעַת שָׂרֵ֣י פָּרַ֣ס וּמָדַ֗י רֹאֵי֙ פְּנֵ֣י הַמֶּ֔לֶךְ הַיֹּשְׁבִ֥ים רִאשֹׁנָ֖ה בַּמַּלְכֽוּת:"},{"verse_id":"טו","text":"כְּדָת֙ מַה-לַּעֲשׂ֔וֹת בַּמַּלְכָּ֖ה וַשְׁתִּ֑י עַל אֲשֶׁ֣ר לֹא-עָשְׂתָ֗ה אֶת-מַאֲמַר֙ הַמֶּ֣לֶךְ אֲחַשְׁוֵר֔וֹשׁ בְּיַ֖ד הַסָּרִיסִֽים:"},{"verse_id":"טז","text":"וַיֹּ֣אמֶר מְמוּכָ֗ן לִפְנֵ֤י הַמֶּ֙לֶךְ֙ וְהַשָּׂרִ֔ים לֹא עַל-הַמֶּ֙לֶךְ֙ לְבַדּ֔וֹ עָוְתָ֖ה וַשְׁתִּ֣י הַמַּלְכָּ֑ה כִּ֤י עַל-כָּל-הַשָּׂרִים֙ וְעַל-כָּל-הָעַמִּ֔ים אֲשֶׁ֕ר בְּכָל-מְדִינ֖וֹת הַמֶּ֥לֶךְ אֲחַשְׁוֵרֽוֹשׁ:"},{"verse_id":"יז","text":"כִּֽי-יֵצֵ֤א דְבַר-הַמַּלְכָּה֙ עַל-כָּל-הַנָּשִׁ֔ים לְהַבְז֥וֹת בַּעְלֵיהֶ֖ן בְּעֵינֵיהֶ֑ן בְּאָמְרָ֗ם הַמֶּ֣לֶךְ אֲחַשְׁוֵר֡וֹשׁ אָמַ֞ר לְהָבִ֨יא אֶת-וַשְׁתִּ֧י הַמַּלְכָּ֛ה לְפָנָ֖יו וְלֹא-בָֽאָה:"},{"verse_id":"יח","text":"וְהַיּ֨וֹם הַזֶּ֜ה תֹּאמַ֣רְנָה שָׂר֣וֹת פָּרַס-וּמָדַ֗י אֲשֶׁ֤ר שָׁמְעוּ֙ אֶת-דְּבַ֣ר הַמַּלְכָּ֔ה לְכֹ֖ל שָׂרֵ֣י הַמֶּ֑לֶךְ וּכְדַ֖י בִּזָּי֥וֹן וָקָֽצֶף:"},{"verse_id":"יט","text":"אִם-עַל-הַמֶּ֣לֶךְ ט֗וֹב יֵצֵ֤א דְבַר-מַלְכוּת֙ מִלְּפָנָ֔יו וְיִכָּתֵ֛ב בְּדָתֵ֥י פָרַס-וּמָדַ֖י וְלֹא יַעֲבֹר אֲשֶׁ֨ר לֹא-תָבֹא וַשְׁתִּ֗י לִפְנֵ֙י֙ הַמֶּ֣לֶךְ אֲחַשְׁוֵר֔וֹשׁ וּמַלְכוּתָהּ֙ יִתֵּ֣ן הַמֶּ֔לֶךְ לִרְעוּתָ֖הּ הַטּוֹבָ֥ה מִמֶּֽנָּה:"},{"verse_id":"כ","text":"וְנִשְׁמַע֩ פִּתְגָ֨ם הַמֶּ֤לֶךְ אֲשֶֽׁר-יַעֲשֶׂה֙ בְּכָל-מַלְכוּת֔וֹ כִּ֥י רַבָּ֖ה הִ֑יא וְכָל-הַנָּשִׁ֗ים יִתְּנ֤וּ יְקָר֙ לְבַעְלֵיהֶ֔ן לְמִגָּד֖וֹל וְעַד-קָטָֽן:"},{"verse_id":"כא","text":"וַיִּיטַב֙ הַדָּבָ֔ר בְּעֵינֵ֥י הַמֶּ֖לֶךְ וְהַשָּׂרִ֑ים וַיַּעֲשׂ הַמֶּ֖לֶךְ כִּדְבַ֥ר מְמוּכָֽן:"},{"verse_id":"כב","text":"וַיִּשְׁלַ֤ח סְפָרִים֙ אֶל-כָּל-מְדִינ֣וֹת הַמֶּ֔לֶךְ אֶל-מְדִינָ֤ה וּמְדִינָ֙ה֙ כִּכְתָבָ֔הּ וְאֶל-עַ֥ם וָעָ֖ם כִּלְשׁוֹנ֑וֹ לִהְי֤וֹת כָּל-אִישׁ֙ שֹׂרֵ֣ר בְּבֵית֔וֹ וּמְדַבֵּ֖ר כִּלְשׁ֥וֹן עַמּֽוֹ:"}]}]};

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
        AppLogger.warn('megilla-listen: could not load esther-he.json, using fallback', e);
        data = MEGILLA_HE_FALLBACK;
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
