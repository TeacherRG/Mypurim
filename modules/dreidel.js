// ===== DREIDEL GAME =====

function renderDreidelGame() {
    contentArea.innerHTML = '';

    const uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

    const strings = {
        ru: {
            title:        'Игра в дрейдл',
            intro:        'Дрейдл — четырёхгранный волчок, с которым дети играют в Хануку. На каждой грани написана еврейская буква: נ (Нун), ג (Гимель), ה (Хе), פ (Пей) — начальные буквы слов «Нес гадоль хайя по» — «Чудо великое было здесь».',
            rulesTitle:   'Правила игры',
            rules: [
                'נ  Нун — ничего не происходит, передай ход',
                'ג  Гимель — заберёшь весь банк!',
                'ה  Хе — заберёшь половину банка',
                'פ  Пей — положи монету в банк'
            ],
            spinBtn:      'Крутить дрейдл!',
            restartBtn:   'Начать заново',
            potLabel:     'Банк',
            yourLabel:    'Ваши монеты',
            compLabel:    'Компьютер',
            yourTurn:     'Ваш ход — крутите дрейдл!',
            compTurn:     'Ход компьютера...',
            nunMsg:       'נ Нун — ничего не происходит',
            gimelMsg:     'ג Гимель — вы забираете весь банк!',
            heMsg:        'ה Хе — вы забираете половину банка',
            peyMsg:       'פ Пей — вы кладёте монету в банк',
            compNunMsg:   'נ Нун — компьютер пропускает',
            compGimelMsg: 'ג Гимель — компьютер забирает весь банк!',
            compHeMsg:    'ה Хе — компьютер забирает половину банка',
            compPeyMsg:   'פ Пей — компьютер кладёт монету в банк',
            youWin:       'Поздравляем! Вы победили! 🎉',
            compWins:     'Компьютер победил. Попробуйте ещё раз!',
            addedToPot:   'Банк пополнен — каждый добавил по монете',
            videoTitle:   'А теперь потанцуем! ושמחת בחגך',
            videoDesc:    'Авраам Фрид и Лиор Наркис — «И возрадуешься в праздник твой»',
            modeSpin:     'Просто крутить',
            modeGame:     'Играть с компьютером',
            spinPrompt:   'Нажмите кнопку, чтобы крутить дрейдл!'
        },
        uk: {
            title:        'Гра в дрейдл',
            intro:        'Дрейдл — чотиригранний дзига, з яким діти грають на Хануку. На кожній грані написана єврейська буква: נ (Нун), ג (Гімель), ה (Хе), פ (Пей) — початкові літери слів «Нес гадоль хая по» — «Чудо велике було тут».',
            rulesTitle:   'Правила гри',
            rules: [
                'נ  Нун — нічого не відбувається, передай хід',
                'ג  Гімель — забираєш весь банк!',
                'ה  Хе — забираєш половину банку',
                'פ  Пей — кладеш монету в банк'
            ],
            spinBtn:      'Крутити дрейдл!',
            restartBtn:   'Почати знову',
            potLabel:     'Банк',
            yourLabel:    'Ваші монети',
            compLabel:    'Комп\'ютер',
            yourTurn:     'Ваш хід — крутіть дрейдл!',
            compTurn:     'Хід комп\'ютера...',
            nunMsg:       'נ Нун — нічого не відбувається',
            gimelMsg:     'ג Гімель — ви забираєте весь банк!',
            heMsg:        'ה Хе — ви забираєте половину банку',
            peyMsg:       'פ Пей — ви кладете монету в банк',
            compNunMsg:   'נ Нун — комп\'ютер пропускає',
            compGimelMsg: 'ג Гімель — комп\'ютер забирає весь банк!',
            compHeMsg:    'ה Хе — комп\'ютер забирає половину банку',
            compPeyMsg:   'פ Пей — комп\'ютер кладе монету в банк',
            youWin:       'Вітаємо! Ви перемогли! 🎉',
            compWins:     'Комп\'ютер переміг. Спробуйте ще раз!',
            addedToPot:   'Банк поповнено — кожен додав по монеті',
            videoTitle:   'А тепер потанцюємо! ושמחת בחגך',
            videoDesc:    'Авраам Фрід і Ліор Наркіс — «І зрадієш у свято твоє»',
            modeSpin:     'Просто крутити',
            modeGame:     'Грати з комп\'ютером',
            spinPrompt:   'Натисніть кнопку, щоб покрутити дрейдл!'
        },
        de: {
            title:        'Dreidel-Spiel',
            intro:        'Der Dreidel ist ein vierseitiger Kreisel, mit dem Kinder zu Chanukka spielen. Auf jeder Seite steht ein hebräischer Buchstabe: נ (Nun), ג (Gimel), ה (He), פ (Pe) — Anfangsbuchstaben von „Nes gadol haja po" — „Ein großes Wunder geschah hier".',
            rulesTitle:   'Spielregeln',
            rules: [
                'נ  Nun — nichts passiert, weitergeben',
                'ג  Gimel — du nimmst den ganzen Topf!',
                'ה  He — du nimmst die Hälfte des Topfes',
                'פ  Pe — du legst eine Münze in den Topf'
            ],
            spinBtn:      'Dreidel drehen!',
            restartBtn:   'Neu starten',
            potLabel:     'Topf',
            yourLabel:    'Ihre Münzen',
            compLabel:    'Computer',
            yourTurn:     'Ihr Zug — drehen Sie den Dreidel!',
            compTurn:     'Zug des Computers...',
            nunMsg:       'נ Nun — nichts passiert',
            gimelMsg:     'ג Gimel — Sie nehmen den ganzen Topf!',
            heMsg:        'ה He — Sie nehmen die Hälfte des Topfes',
            peyMsg:       'פ Pe — Sie legen eine Münze in den Topf',
            compNunMsg:   'נ Nun — Computer setzt aus',
            compGimelMsg: 'ג Gimel — Computer nimmt den ganzen Topf!',
            compHeMsg:    'ה He — Computer nimmt die Hälfte des Topfes',
            compPeyMsg:   'פ Pe — Computer legt eine Münze in den Topf',
            youWin:       'Herzlichen Glückwunsch! Sie haben gewonnen! 🎉',
            compWins:     'Der Computer hat gewonnen. Versuchen Sie es nochmal!',
            addedToPot:   'Topf aufgefüllt — jeder legte eine Münze hinein',
            videoTitle:   'Und jetzt tanzen! ושמחת בחגך',
            videoDesc:    'Avraham Fried und Lior Narkis — „Und du wirst fröhlich sein an deinem Fest"',
            modeSpin:     'Nur drehen',
            modeGame:     'Gegen den Computer spielen',
            spinPrompt:   'Klicken Sie die Schaltfläche, um den Dreidel zu drehen!'
        },
        he: {
            title:        'משחק סביבון',
            intro:        'הסביבון הוא כלי משחק בעל ארבעה פאות שמסתובב. על כל פאה כתובה אות עברית: נ (נון), ג (גימל), ה (הא), פ (פא) — ראשי תיבות של "נס גדול היה פה".',
            rulesTitle:   'חוקי המשחק',
            rules: [
                'נ  נון — לא קורה כלום, עביר תור',
                'ג  גימל — לוקחים את כל הבנק!',
                'ה  הא — לוקחים חצי מהבנק',
                'פ  פא — שמים מטבע בבנק'
            ],
            spinBtn:      'סובב סביבון!',
            restartBtn:   'התחל מחדש',
            potLabel:     'בנק',
            yourLabel:    'המטבעות שלך',
            compLabel:    'מחשב',
            yourTurn:     'התור שלך — סובב סביבון!',
            compTurn:     'תור המחשב...',
            nunMsg:       'נ נון — לא קורה כלום',
            gimelMsg:     'ג גימל — אתה לוקח את כל הבנק!',
            heMsg:        'ה הא — אתה לוקח חצי מהבנק',
            peyMsg:       'פ פא — אתה שם מטבע בבנק',
            compNunMsg:   'נ נון — המחשב מדלג',
            compGimelMsg: 'ג גימל — המחשב לוקח את כל הבנק!',
            compHeMsg:    'ה הא — המחשב לוקח חצי מהבנק',
            compPeyMsg:   'פ פא — המחשב שם מטבע בבנק',
            youWin:       'כל הכבוד! ניצחת! 🎉',
            compWins:     'המחשב ניצח. נסה שוב!',
            addedToPot:   'הבנק הוגדל — כל אחד הוסיף מטבע',
            videoTitle:   'ועכשיו נרקוד! ושמחת בחגך',
            videoDesc:    'אברהם פריד וליאור נרקיס — "ושמחת בחגך"',
            modeSpin:     'רק לסובב',
            modeGame:     'לשחק נגד המחשב',
            spinPrompt:   'לחץ על הכפתור כדי לסובב את הסביבון!'
        }
    };

    var s = strings[uiLang];

    // --- Title ---
    var h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = s.title;
    contentArea.appendChild(h2);

    // --- Intro paragraph ---
    var intro = document.createElement('p');
    intro.className = 'dreidel-intro-text';
    intro.textContent = s.intro;
    contentArea.appendChild(intro);

    // --- Rules ---
    var rulesBox = document.createElement('div');
    rulesBox.className = 'dreidel-rules';
    var rulesTitle = document.createElement('strong');
    rulesTitle.textContent = s.rulesTitle + ':';
    rulesBox.appendChild(rulesTitle);
    var ul = document.createElement('ul');
    s.rules.forEach(function (r) {
        var li = document.createElement('li');
        li.textContent = r;
        ul.appendChild(li);
    });
    rulesBox.appendChild(ul);
    contentArea.appendChild(rulesBox);

    // --- Game container ---
    var gameWrap = document.createElement('div');
    gameWrap.className = 'dreidel-game';

    // Mode selector (default: spin)
    var modeSel = document.createElement('div');
    modeSel.className = 'dreidel-mode-selector';

    var modeSpinBtn = document.createElement('button');
    modeSpinBtn.className = 'dreidel-mode-btn active';
    modeSpinBtn.textContent = s.modeSpin;

    var modeGameBtn = document.createElement('button');
    modeGameBtn.className = 'dreidel-mode-btn';
    modeGameBtn.textContent = s.modeGame;

    modeSel.appendChild(modeSpinBtn);
    modeSel.appendChild(modeGameBtn);
    gameWrap.appendChild(modeSel);

    // Scoreboard (hidden in spin mode by default)
    var scoreboard = document.createElement('div');
    scoreboard.className = 'dreidel-scoreboard';
    scoreboard.style.display = 'none';

    function makeStatBox(label, id, value) {
        var box = document.createElement('div');
        box.className = 'dreidel-stat';
        var lbl = document.createElement('div');
        lbl.className = 'dreidel-stat-label';
        lbl.textContent = label;
        var val = document.createElement('div');
        val.className = 'dreidel-stat-value';
        val.id = id;
        val.textContent = value;
        box.appendChild(lbl);
        box.appendChild(val);
        return box;
    }

    scoreboard.appendChild(makeStatBox(s.yourLabel, 'dg-player-coins', '10'));
    scoreboard.appendChild(makeStatBox(s.potLabel,   'dg-pot',          '2'));
    scoreboard.appendChild(makeStatBox(s.compLabel,  'dg-comp-coins',   '10'));
    gameWrap.appendChild(scoreboard);

    // Dreidel visual + controls
    var middle = document.createElement('div');
    middle.className = 'dreidel-middle';

    var dreidelWrap = document.createElement('div');
    dreidelWrap.className = 'dreidel-wrap';
    dreidelWrap.id = 'dreidel-wrap';

    dreidelWrap.innerHTML =
        '<div class="dreidel-figure" id="dreidel-figure">' +
            '<div class="dreidel-handle"></div>' +
            '<div class="dreidel-body"><span class="dreidel-letter" id="dreidel-letter">?</span></div>' +
            '<div class="dreidel-tip"></div>' +
        '</div>';

    middle.appendChild(dreidelWrap);

    var controls = document.createElement('div');
    controls.className = 'dreidel-controls';

    var statusMsg = document.createElement('div');
    statusMsg.className = 'dreidel-status';
    statusMsg.id = 'dreidel-status';
    statusMsg.textContent = s.spinPrompt;
    controls.appendChild(statusMsg);

    var spinBtn = document.createElement('button');
    spinBtn.className = 'dreidel-spin-btn';
    spinBtn.id = 'dreidel-spin-btn';
    spinBtn.textContent = s.spinBtn;
    controls.appendChild(spinBtn);

    var restartBtn = document.createElement('button');
    restartBtn.className = 'dreidel-restart-btn';
    restartBtn.id = 'dreidel-restart-btn';
    restartBtn.textContent = s.restartBtn;
    restartBtn.style.display = 'none';
    controls.appendChild(restartBtn);

    middle.appendChild(controls);
    gameWrap.appendChild(middle);
    contentArea.appendChild(gameWrap);

    // --- Dance video section ---
    var videoSection = document.createElement('div');
    videoSection.className = 'dreidel-video-section';

    var videoTitle = document.createElement('h3');
    videoTitle.className = 'dreidel-video-title';
    videoTitle.textContent = s.videoTitle;
    videoSection.appendChild(videoTitle);

    var videoDesc = document.createElement('p');
    videoDesc.className = 'dreidel-video-desc';
    videoDesc.textContent = s.videoDesc;
    videoSection.appendChild(videoDesc);

    var videoWrap = document.createElement('div');
    videoWrap.className = 'dreidel-video-wrap';

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/eUbOLu3Up_o';
    iframe.title = s.videoDesc;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.className = 'dreidel-video-iframe';
    videoWrap.appendChild(iframe);
    videoSection.appendChild(videoWrap);
    contentArea.appendChild(videoSection);

    // --- Game Logic ---
    var gameMode = 'spin'; // 'spin' | 'game'

    var gs = {
        playerCoins: 10,
        compCoins:   10,
        pot:         2,
        isPlayerTurn: true,
        spinning:    false,
        over:        false
    };

    var SIDES = [
        { letter: 'נ', action: 'nun'   },
        { letter: 'ג', action: 'gimel' },
        { letter: 'ה', action: 'he'    },
        { letter: 'פ', action: 'pey'   }
    ];

    function updateDisplay() {
        document.getElementById('dg-player-coins').textContent = gs.playerCoins;
        document.getElementById('dg-pot').textContent = gs.pot;
        document.getElementById('dg-comp-coins').textContent = gs.compCoins;
    }

    function randomSide() {
        return SIDES[Math.floor(Math.random() * 4)];
    }

    function ensurePot() {
        if (gs.pot === 0) {
            if (gs.playerCoins > 0) { gs.playerCoins--; gs.pot++; }
            if (gs.compCoins > 0)   { gs.compCoins--;   gs.pot++; }
            document.getElementById('dreidel-status').textContent = s.addedToPot;
        }
    }

    function applyResult(side, isPlayer) {
        var statusEl = document.getElementById('dreidel-status');

        if (isPlayer) {
            if (side.action === 'nun') {
                statusEl.textContent = s.nunMsg;
            } else if (side.action === 'gimel') {
                gs.playerCoins += gs.pot;
                gs.pot = 0;
                statusEl.textContent = s.gimelMsg;
            } else if (side.action === 'he') {
                var half = Math.ceil(gs.pot / 2);
                gs.playerCoins += half;
                gs.pot -= half;
                statusEl.textContent = s.heMsg;
            } else if (side.action === 'pey') {
                if (gs.playerCoins > 0) { gs.playerCoins--; gs.pot++; }
                statusEl.textContent = s.peyMsg;
            }
        } else {
            if (side.action === 'nun') {
                statusEl.textContent = s.compNunMsg;
            } else if (side.action === 'gimel') {
                gs.compCoins += gs.pot;
                gs.pot = 0;
                statusEl.textContent = s.compGimelMsg;
            } else if (side.action === 'he') {
                var half2 = Math.ceil(gs.pot / 2);
                gs.compCoins += half2;
                gs.pot -= half2;
                statusEl.textContent = s.compHeMsg;
            } else if (side.action === 'pey') {
                if (gs.compCoins > 0) { gs.compCoins--; gs.pot++; }
                statusEl.textContent = s.compPeyMsg;
            }
        }

        updateDisplay();
        ensurePot();

        // Check win/lose
        if (gs.compCoins <= 0) {
            gs.over = true;
            statusEl.textContent = s.youWin;
            document.getElementById('dreidel-spin-btn').disabled = true;
            return;
        }
        if (gs.playerCoins <= 0) {
            gs.over = true;
            statusEl.textContent = s.compWins;
            document.getElementById('dreidel-spin-btn').disabled = true;
            return;
        }
    }

    function doSpin(isPlayer) {
        if (gs.spinning) return;
        if (gameMode === 'game' && gs.over) return;
        gs.spinning = true;

        var btn = document.getElementById('dreidel-spin-btn');
        btn.disabled = true;

        var fig = document.getElementById('dreidel-figure');
        var letterEl = document.getElementById('dreidel-letter');

        // Clear previous pop animation before new spin
        letterEl.classList.remove('pop');
        fig.classList.add('spinning');

        setTimeout(function () {
            var result = randomSide();
            fig.classList.remove('spinning');
            gs.spinning = false;

            // Trigger letter pop-in reveal
            void letterEl.offsetWidth; // reflow to restart animation
            letterEl.textContent = result.letter;
            letterEl.classList.add('pop');

            if (gameMode === 'spin') {
                // Just-spin mode: show the matching rule, re-enable button immediately
                var ruleIdx = { nun: 0, gimel: 1, he: 2, pey: 3 }[result.action];
                document.getElementById('dreidel-status').textContent = s.rules[ruleIdx];
                btn.disabled = false;
            } else {
                // Game mode: apply result and handle turns
                applyResult(result, isPlayer);

                if (!gs.over) {
                    if (isPlayer) {
                        gs.isPlayerTurn = false;
                        document.getElementById('dreidel-status').textContent = s.compTurn;
                        setTimeout(function () { doSpin(false); }, 1400);
                    } else {
                        gs.isPlayerTurn = true;
                        setTimeout(function () {
                            if (!gs.over) {
                                document.getElementById('dreidel-status').textContent = s.yourTurn;
                                btn.disabled = false;
                            }
                        }, 1000);
                    }
                }
            }
        }, 3000);
    }

    spinBtn.addEventListener('click', function () {
        if (gameMode === 'spin') {
            if (!gs.spinning) doSpin(true);
        } else {
            if (!gs.spinning && !gs.over && gs.isPlayerTurn) doSpin(true);
        }
    });

    restartBtn.addEventListener('click', function () {
        gs.playerCoins  = 10;
        gs.compCoins    = 10;
        gs.pot          = 2;
        gs.isPlayerTurn = true;
        gs.spinning     = false;
        gs.over         = false;
        document.getElementById('dreidel-letter').textContent = '?';
        document.getElementById('dreidel-letter').classList.remove('pop');
        document.getElementById('dreidel-figure').classList.remove('spinning');
        document.getElementById('dreidel-status').textContent = s.yourTurn;
        document.getElementById('dreidel-spin-btn').disabled = false;
        updateDisplay();
    });

    // Mode switch handlers
    modeSpinBtn.addEventListener('click', function () {
        if (gameMode === 'spin') return;
        gameMode = 'spin';
        modeSpinBtn.classList.add('active');
        modeGameBtn.classList.remove('active');
        scoreboard.style.display = 'none';
        restartBtn.style.display = 'none';
        gs.spinning = false;
        document.getElementById('dreidel-figure').classList.remove('spinning');
        document.getElementById('dreidel-letter').textContent = '?';
        document.getElementById('dreidel-letter').classList.remove('pop');
        document.getElementById('dreidel-status').textContent = s.spinPrompt;
        document.getElementById('dreidel-spin-btn').disabled = false;
    });

    modeGameBtn.addEventListener('click', function () {
        if (gameMode === 'game') return;
        gameMode = 'game';
        modeGameBtn.classList.add('active');
        modeSpinBtn.classList.remove('active');
        scoreboard.style.display = '';
        restartBtn.style.display = '';
        gs.playerCoins  = 10;
        gs.compCoins    = 10;
        gs.pot          = 2;
        gs.isPlayerTurn = true;
        gs.spinning     = false;
        gs.over         = false;
        document.getElementById('dreidel-figure').classList.remove('spinning');
        document.getElementById('dreidel-letter').textContent = '?';
        document.getElementById('dreidel-letter').classList.remove('pop');
        document.getElementById('dreidel-status').textContent = s.yourTurn;
        document.getElementById('dreidel-spin-btn').disabled = false;
        updateDisplay();
    });
}
