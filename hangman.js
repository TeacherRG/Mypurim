// ===== REVERSE HANGMAN — HANG HAMAN! =====
// Self-contained module. Inject via <script src="hangman.js"> before app.js.
// Integration: call HangmanGame.render(container, langMode) from app.js.

const HangmanGame = (function () {
    'use strict';

    // ── Words from the Megillah (7–9 letters — too long to guess in 3 tries) ──
    const WORDS = [
        { word: 'АХАШВЕРОШ', hint_ru: 'Царь Персии и Мидии',           hint_uk: 'Цар Персії та Мідії',           hint_de: 'König von Persien und Medien'   },
        { word: 'МОРДЕХАЙ',  hint_ru: 'Иудей из колена Вениаминова',   hint_uk: 'Іудей із коліна Веніамінового', hint_de: 'Jude aus dem Stamm Benjamin'    },
        { word: 'ХАРБОНА',   hint_ru: 'Слуга царя Ахашвероша',         hint_uk: 'Слуга царя Ахашвероша',         hint_de: 'Diener des Königs Ahasverus'    },
        { word: 'МЕМУХАН',   hint_ru: 'Советник царя',                 hint_uk: 'Радник царя',                   hint_de: 'Ratgeber des Königs'             },
        { word: 'БИРТАН',    hint_ru: 'Заговорщик при дворе царя',     hint_uk: 'Змовник при дворі царя',        hint_de: 'Verschwörer am Königshof'       },
        { word: 'ВИГФАН',    hint_ru: 'Стражник, замысливший зло',     hint_uk: 'Охоронець, що задумав зло',     hint_de: 'Wächter, der Böses plante'      }
    ];

    const MAX_WRONG = 3;

    // Full Russian alphabet for keyboard
    const ALPHA = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

    // ── Game State ────────────────────────────────────────────────────────────
    let gs = { word: '', hint: '', guessed: new Set(), wrong: 0, over: false, hanged: false };

    function pickWord(lang) {
        const item = WORDS[Math.floor(Math.random() * WORDS.length)];
        const hintKey = 'hint_' + (lang === 'uk' ? 'uk' : lang === 'de' ? 'de' : 'ru');
        gs = { word: item.word, hint: item[hintKey] || item.hint_ru,
               guessed: new Set(), wrong: 0, over: false, hanged: false };
    }

    // ── Inline translations ───────────────────────────────────────────────────
    const STR = {
        ru: {
            title:      'Повесь Амана!',
            subtitle:   'Угадай слово из Мегилы — но попыток всего три...',
            hint:       'Подсказка:',
            wrongOf:    'Неверных ходов:',
            playAgain:  'Играть снова',
            winTitle:   '🎉 Аман повешен! 🎉',
            winMsg:     'Пурим! Злодей Аман поплатился за свои замыслы!',
            loseTitle:  'Аман сбежал...',
            loseMsg:    'Ты угадал слово — невероятно! Аман ускользнул.',
            wordWas:    'Слово было:'
        },
        uk: {
            title:      'Повіш Амана!',
            subtitle:   'Вгадай слово з Мегіли — але спроб усього три...',
            hint:       'Підказка:',
            wrongOf:    'Помилкових ходів:',
            playAgain:  'Грати знову',
            winTitle:   '🎉 Амана повішено! 🎉',
            winMsg:     'Пурим! Злодій Аман поплатився за свої задуми!',
            loseTitle:  'Аман утік...',
            loseMsg:    'Ти вгадав слово — неймовірно! Аман утік.',
            wordWas:    'Слово було:'
        },
        de: {
            title:      'Häng Haman auf!',
            subtitle:   'Errate das Wort aus der Megilla — nur drei Versuche...',
            hint:       'Hinweis:',
            wrongOf:    'Falsche Züge:',
            playAgain:  'Nochmal spielen',
            winTitle:   '🎉 Haman ist gehängt! 🎉',
            winMsg:     'Purim! Der Bösewicht Haman hat den Preis für seine Pläne bezahlt!',
            loseTitle:  'Haman ist entkommen...',
            loseMsg:    'Du hast das Wort erraten — unglaublich! Haman ist entkommen.',
            wordWas:    'Das Wort war:'
        }
    };

    function uiLang(langMode) {
        if (langMode === 'uk') return 'uk';
        if (langMode === 'de') return 'de';
        return 'ru';
    }

    function s(key, langMode) {
        const l = uiLang(langMode);
        return (STR[l] || STR.ru)[key] || STR.ru[key] || key;
    }

    // ── SVG Gallows + Haman ───────────────────────────────────────────────────
    // viewBox: 0 0 220 280
    // Gallows always visible. Haman appears part by part.
    // wrong=1 → head  wrong=2 → body+arms  wrong=3 → legs + swing animation
    function buildSVG(wrong, hanged) {
        const showHead  = wrong >= 1;
        const showBody  = wrong >= 2;
        const showLegs  = wrong >= 3;
        const swingCls  = hanged ? 'hm-swing' : '';

        // Rope top point is (130, 22); noose bottom is (130, 52).
        // Head center: (130, 74). Body: 74+20=94 to 160. Arms from 110. Legs from 160.
        const head = showHead ? `
          <circle cx="130" cy="74" r="20" fill="#f5c878" stroke="#c8860a" stroke-width="2"/>
          <!-- dead-eyes -->
          <text x="121" y="71" fill="#8b4513" font-size="11" font-family="monospace" font-weight="bold">×</text>
          <text x="133" y="71" fill="#8b4513" font-size="11" font-family="monospace" font-weight="bold">×</text>
          <!-- Haman's pointed hat (three-cornered) -->
          <polygon points="108,57 130,22 152,57" fill="#9b1c2e" stroke="#6b0f1e" stroke-width="2"/>
          <rect x="104" y="56" width="52" height="7" rx="2" fill="#7a1524"/>
          <!-- smirk -->
          <path d="M 122 82 Q 130 88 138 82" stroke="#8b4513" stroke-width="2" fill="none" stroke-linecap="round"/>
        ` : '';

        const body = showBody ? `
          <!-- torso -->
          <line x1="130" y1="94" x2="130" y2="162"
                stroke="#8b5e3c" stroke-width="5" stroke-linecap="round"/>
          <!-- left arm -->
          <line x1="130" y1="114" x2="100" y2="148"
                stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/>
          <!-- right arm -->
          <line x1="130" y1="114" x2="160" y2="148"
                stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/>
        ` : '';

        const legs = showLegs ? `
          <!-- left leg -->
          <line x1="130" y1="162" x2="104" y2="210"
                stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/>
          <!-- right leg -->
          <line x1="130" y1="162" x2="156" y2="210"
                stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/>
        ` : '';

        return `
        <svg class="hm-svg" viewBox="0 0 220 260"
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- ground -->
          <line x1="10" y1="248" x2="210" y2="248"
                stroke="#c8860a" stroke-width="5" stroke-linecap="round"/>
          <!-- vertical pole -->
          <line x1="44" y1="248" x2="44" y2="14"
                stroke="#c8860a" stroke-width="6" stroke-linecap="round"/>
          <!-- horizontal beam -->
          <line x1="44" y1="14" x2="148" y2="14"
                stroke="#c8860a" stroke-width="6" stroke-linecap="round"/>
          <!-- diagonal brace -->
          <line x1="44" y1="44" x2="74" y2="14"
                stroke="#c8860a" stroke-width="4" stroke-linecap="round"/>
          <!-- rope -->
          <line x1="130" y1="14" x2="130" y2="36"
                stroke="#a0522d" stroke-width="3"/>
          <!-- noose circle -->
          <ellipse cx="130" cy="44" rx="11" ry="8"
                   fill="none" stroke="#a0522d" stroke-width="3"/>
          <!-- Haman figure group (swings from noose point) -->
          <g class="${swingCls}" style="transform-origin: 130px 44px; transform-box: fill-box;">
            <!-- neck connector -->
            <line x1="130" y1="52" x2="130" y2="${showHead ? 54 : 52}"
                  stroke="#a0522d" stroke-width="3"/>
            ${head}
            ${body}
            ${legs}
          </g>
        </svg>`;
    }

    // ── Word tiles ────────────────────────────────────────────────────────────
    function buildWord() {
        return [...gs.word].map(function (ch) {
            const rev = gs.guessed.has(ch);
            return '<span class="hm-tile' + (rev ? ' hm-tile-on' : '') + '">'
                 + (rev ? ch : '') + '</span>';
        }).join('');
    }

    // ── Keyboard ──────────────────────────────────────────────────────────────
    function buildKeys() {
        return ALPHA.map(function (l) {
            const used    = gs.guessed.has(l);
            const correct = used && gs.word.includes(l);
            const wrong   = used && !gs.word.includes(l);
            let cls = 'hm-key';
            if (correct) cls += ' hm-key-ok';
            else if (wrong) cls += ' hm-key-no';
            const dis = (used || gs.over) ? ' disabled' : '';
            return '<button class="' + cls + '" data-l="' + l + '"' + dis + '>' + l + '</button>';
        }).join('');
    }

    // ── Attempt dots ──────────────────────────────────────────────────────────
    function buildDots() {
        var html = '';
        for (var i = 0; i < MAX_WRONG; i++) {
            html += '<div class="hm-dot' + (i < gs.wrong ? ' hm-dot-on' : '') + '"></div>';
        }
        return html;
    }

    // ── Full HTML skeleton (rendered once per game) ───────────────────────────
    function buildHTML(langMode) {
        return `
<div class="hm-wrap">
  <h2 class="hm-title">${s('title', langMode)}</h2>
  <p class="hm-sub">${s('subtitle', langMode)}</p>

  <div class="hm-arena">
    <div class="hm-scaffold" id="hm-scaffold">
      ${buildSVG(gs.wrong, false)}
    </div>

    <div class="hm-board">
      <div class="hm-hint">
        <span class="hm-hint-lbl">${s('hint', langMode)}</span>
        <span class="hm-hint-txt">${gs.hint}</span>
      </div>

      <div class="hm-word" id="hm-word">${buildWord()}</div>

      <div class="hm-stats">
        <span class="hm-wrong-lbl">${s('wrongOf', langMode)}</span>
        <span class="hm-wrong-n" id="hm-wrong-n">${gs.wrong}</span>
        <span class="hm-wrong-max"> / ${MAX_WRONG}</span>
      </div>
      <div class="hm-dots" id="hm-dots">${buildDots()}</div>
    </div>
  </div>

  <!-- Result panel (hidden until game over) -->
  <div class="hm-result hm-result-hidden" id="hm-result">
    <div class="hm-res-title" id="hm-res-title"></div>
    <div class="hm-res-msg"   id="hm-res-msg"></div>
    <div class="hm-res-word"  id="hm-res-word"></div>
    <button class="hm-btn-again" id="hm-btn-again">${s('playAgain', langMode)}</button>
  </div>

  <div class="hm-keys" id="hm-keys">${buildKeys()}</div>
</div>`;
    }

    // ── Partial DOM update after each guess ───────────────────────────────────
    function update(root, langMode) {
        // Scaffold
        root.querySelector('#hm-scaffold').innerHTML = buildSVG(gs.wrong, gs.hanged);

        // Word tiles — only reveal newly guessed correct letters (with animation)
        root.querySelectorAll('.hm-tile').forEach(function (tile, i) {
            const ch = gs.word[i];
            if (gs.guessed.has(ch) && !tile.classList.contains('hm-tile-on')) {
                tile.classList.add('hm-tile-on');
                tile.textContent = ch;
            }
        });

        // Counter
        root.querySelector('#hm-wrong-n').textContent = gs.wrong;

        // Dots
        root.querySelector('#hm-dots').innerHTML = buildDots();

        // Keyboard buttons
        root.querySelectorAll('.hm-key').forEach(function (btn) {
            const l = btn.dataset.l;
            if (gs.guessed.has(l)) {
                btn.disabled = true;
                if (gs.word.includes(l))  btn.classList.add('hm-key-ok');
                else                      btn.classList.add('hm-key-no');
            }
            if (gs.over) btn.disabled = true;
        });

        // Game-over panel
        if (gs.over) {
            const panel = root.querySelector('#hm-result');
            panel.classList.remove('hm-result-hidden');
            panel.classList.add(gs.hanged ? 'hm-result-win' : 'hm-result-lose');
            root.querySelector('#hm-res-title').textContent =
                s(gs.hanged ? 'winTitle' : 'loseTitle', langMode);
            root.querySelector('#hm-res-msg').textContent =
                s(gs.hanged ? 'winMsg' : 'loseMsg', langMode);
            root.querySelector('#hm-res-word').textContent =
                s('wordWas', langMode) + ' ' + gs.word;
        }
    }

    // ── Logic ─────────────────────────────────────────────────────────────────
    function guess(letter, root, langMode) {
        if (gs.over || gs.guessed.has(letter)) return;
        gs.guessed.add(letter);

        if (!gs.word.includes(letter)) {
            gs.wrong++;
            if (gs.wrong >= MAX_WRONG) {
                gs.over   = true;
                gs.hanged = true;         // Haman hanged = Purim WIN
            }
        } else {
            // Check if every letter in the word is now guessed
            const allDone = gs.word.split('').every(function (c) { return gs.guessed.has(c); });
            if (allDone) {
                gs.over   = true;
                gs.hanged = false;        // Haman escaped (very rare)
            }
        }

        update(root, langMode);
    }

    // ── Event wiring ──────────────────────────────────────────────────────────
    function wire(root, langMode) {
        root.querySelectorAll('.hm-key').forEach(function (btn) {
            btn.addEventListener('click', function () {
                guess(btn.dataset.l, root, langMode);
            });
        });
        const again = root.querySelector('#hm-btn-again');
        if (again) {
            again.addEventListener('click', function () {
                render(root, langMode);
            });
        }
    }

    // ── CSS injection (once) ──────────────────────────────────────────────────
    function injectCSS() {
        if (document.getElementById('hm-css')) return;
        var el = document.createElement('style');
        el.id = 'hm-css';
        el.textContent = `
/* ===== Reverse Hangman — Hang Haman! ============================= */

.hm-wrap {
    max-width: 700px;
    margin: 0 auto;
    padding: 4px 0 36px;
    font-family: 'Inter', sans-serif;
}

/* Title */
.hm-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 800;
    color: #1e1f3a;
    text-align: center;
    margin: 0 0 4px;
}
.hm-sub {
    text-align: center;
    color: #777;
    font-size: 13px;
    margin: 0 0 28px;
}

/* Arena row */
.hm-arena {
    display: flex;
    gap: 28px;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20px;
}

/* Gallows / SVG */
.hm-scaffold { flex-shrink: 0; }
.hm-svg {
    width: 200px;
    height: 236px;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,.13));
}

/* Haman swing animation */
@keyframes hmSwing {
    0%   { transform: rotate(0deg);    }
    8%   { transform: rotate(-22deg);  }
    22%  { transform: rotate(16deg);   }
    36%  { transform: rotate(-11deg);  }
    50%  { transform: rotate(8deg);    }
    65%  { transform: rotate(-5deg);   }
    78%  { transform: rotate(3deg);    }
    88%  { transform: rotate(-2deg);   }
    100% { transform: rotate(-2deg);   }
}
.hm-swing {
    animation: hmSwing 1.6s cubic-bezier(.4,0,.2,1) forwards;
}

/* Board (word + stats) */
.hm-board {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 20px;
}

/* Hint */
.hm-hint {
    background: #fff8e8;
    border-left: 4px solid #ffcc00;
    padding: 9px 13px;
    border-radius: 0 8px 8px 0;
    font-size: 13px;
    line-height: 1.5;
}
.hm-hint-lbl {
    font-weight: 700;
    color: #9a6600;
    margin-right: 5px;
}
.hm-hint-txt { color: #555; }

/* Word tiles */
.hm-word {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}
.hm-tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 42px;
    font-size: 20px;
    font-weight: 800;
    color: #1a4a1a;
    border-bottom: 3px solid #1e1f3a;
    transition: border-color .2s;
}
.hm-tile-on {
    border-bottom-color: #1a4a1a;
    animation: hmPop .35s ease-out both;
}
@keyframes hmPop {
    0%   { transform: scale(1.9); opacity: 0; }
    60%  { transform: scale(.88); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
}

/* Stats row */
.hm-stats {
    font-size: 13px;
    color: #666;
}
.hm-wrong-n { font-weight: 700; color: #b71c1c; }

/* Attempt dots */
.hm-dots { display: flex; gap: 8px; }
.hm-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ddd;
    border: 2px solid #bbb;
    transition: background .25s, border-color .25s;
}
.hm-dot-on { background: #b71c1c; border-color: #7f0000; }

/* Result panel */
.hm-result {
    text-align: center;
    padding: 22px 20px;
    border-radius: 14px;
    margin-bottom: 22px;
    animation: hmFadeUp .45s ease both;
}
@keyframes hmFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
}
.hm-result-hidden { display: none; }
.hm-result-win  { background: linear-gradient(135deg,#fff3cc,#ffe066); border: 2px solid #ffcc00; }
.hm-result-lose { background: #f2f2f2; border: 2px solid #ccc; }
.hm-res-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 800;
    color: #1e1f3a;
    margin-bottom: 6px;
}
.hm-res-msg  { font-size: 15px; color: #444; margin-bottom: 8px; }
.hm-res-word { font-size: 13px; color: #888; margin-bottom: 16px; font-style: italic; }

/* Play-again button */
.hm-btn-again {
    background: linear-gradient(135deg, #ffcc00, #ff8800);
    border: none;
    color: #1e1f3a;
    font-weight: 700;
    font-size: 15px;
    padding: 12px 28px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity .18s, transform .12s;
}
.hm-btn-again:hover { opacity: .9; transform: translateY(-2px); }

/* Keyboard */
.hm-keys {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    max-width: 540px;
    margin: 0 auto;
}
.hm-key {
    width: 36px;
    height: 36px;
    border: 2px solid #2c2f6a;
    background: #fff;
    color: #2c2f6a;
    font-weight: 700;
    font-size: 12px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background .12s, color .12s, opacity .15s;
}
.hm-key:hover:not([disabled]) { background: #2c2f6a; color: #fff; }
.hm-key:disabled { cursor: default; }
.hm-key-ok  { background: #1b5e20 !important; color: #fff !important; border-color: #1b5e20 !important; }
.hm-key-no  { background: #b71c1c !important; color: #fff !important; border-color: #b71c1c !important; }

/* Responsive */
@media (max-width: 580px) {
    .hm-arena         { flex-direction: column; align-items: center; }
    .hm-board         { padding-top: 0; width: 100%; }
    .hm-svg           { width: 160px; height: 188px; }
    .hm-tile          { width: 29px; height: 35px; font-size: 16px; }
    .hm-key           { width: 30px; height: 30px; font-size: 10px; }
}
/* ================================================================= */`;
        document.head.appendChild(el);
    }

    // ── Public: render(container, langMode) ───────────────────────────────────
    function render(container, langMode) {
        injectCSS();
        const lang = uiLang(langMode || 'ru');
        pickWord(lang);
        container.innerHTML = buildHTML(langMode);
        wire(container, langMode);
    }

    return { render: render };

})();
