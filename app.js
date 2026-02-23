// ===== CONFIG =====

const SECTIONS = [
    { id: 'intro'                                          },
    { id: 'dvar_malchut',  type: 'group'                  },
    { id: 'section_a',     group: 'dvar_malchut'          },
    { id: 'section_b',     group: 'dvar_malchut'          },
    { id: 'section_c',     group: 'dvar_malchut'          },
    { id: 'esther_scroll', type: 'pdf'                    },
    { id: 'tzedaka',       type: 'donate'                 },
    { id: 'dreidel',       type: 'game'                   }
];

// ===== STATE =====

let currentId = null;
let langMode = localStorage.getItem('langMode') || 'ru';
let state = { completedSections: [] };

// ===== DOM REFS =====

const sidebarMenu   = document.getElementById('sidebar-menu');
const contentArea   = document.getElementById('content');
const progressFill  = document.getElementById('progress-fill');
const progressPct   = document.getElementById('progress-percent');
const langSelect    = document.getElementById('lang-select');
const navToggle     = document.getElementById('nav-toggle');
const navPopup      = document.getElementById('nav-popup');
const navOverlay    = document.getElementById('nav-overlay');
const navClose      = document.getElementById('nav-close');

// ===== NAV POPUP =====

function openNavPopup() {
    navPopup.classList.add('open');
    navOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeNavPopup() {
    navPopup.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', function () {
    loadProgress();
    langSelect.value = langMode;
    I18N.applyTranslations(langMode);
    renderSidebar();
    loadSection('intro');
    updateProgressBar();

    langSelect.addEventListener('change', function () {
        langMode = this.value;
        localStorage.setItem('langMode', langMode);
        I18N.applyTranslations(langMode);
        renderSidebar();
        if (currentId) loadSection(currentId);
    });

    navToggle.addEventListener('click', openNavPopup);
    navClose.addEventListener('click', closeNavPopup);
    navOverlay.addEventListener('click', closeNavPopup);

    // Close popup on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNavPopup();
    });
});

// ===== SIDEBAR =====

function renderSidebar() {
    sidebarMenu.innerHTML = '';

    // Quiz sections only (no type), in order — used for locking logic
    const quizSections = SECTIONS.filter(function (s) { return !s.type; });

    SECTIONS.forEach(function (section) {
        const li = document.createElement('li');

        // Group header — non-clickable label
        if (section.type === 'group') {
            li.className = 'group-header';
            li.textContent = I18N.sectionTitle(section.id, langMode);
            sidebarMenu.appendChild(li);
            return;
        }

        li.textContent = I18N.sectionTitle(section.id, langMode);

        if (section.group) {
            li.classList.add('sub-item');
        }

        // PDF and donate sections are always accessible — no quiz, no locking
        if (section.type === 'pdf') {
            li.classList.add('pdf-section');
        } else if (section.type === 'donate') {
            li.classList.add('donate-section');
        } else {
            // Locking: first two quiz sections (intro, section_a) always accessible.
            // Each subsequent requires the previous quiz section to be completed.
            const quizIndex = quizSections.findIndex(function (s) { return s.id === section.id; });
            if (quizIndex >= 2) {
                const prevId = quizSections[quizIndex - 1].id;
                if (!state.completedSections.includes(prevId)) {
                    li.classList.add('locked');
                }
            }

            if (state.completedSections.includes(section.id)) {
                li.classList.add('completed');
            }
        }

        if (section.id === currentId) {
            li.classList.add('active');
        }

        li.addEventListener('click', function () {
            if (!li.classList.contains('locked')) {
                loadSection(section.id);
            }
        });

        sidebarMenu.appendChild(li);
    });
}

// ===== LOAD SECTION =====

async function loadSection(id) {
    currentId = id;
    closeNavPopup();

    // PDF and donate sections have special rendering
    const sectionCfg = SECTIONS.find(function (s) { return s.id === id; });
    if (sectionCfg && sectionCfg.type === 'pdf') {
        renderEstherScroll();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'donate') {
        renderTzedaka();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'game') {
        renderDreidelGame();
        renderSidebar();
        updateProgressBar();
        return;
    }

    // Determine translation language folder
    const transFolder = langMode === 'uk' || langMode === 'ru-uk' ? 'uk'
                      : langMode === 'de' || langMode === 'ru-de' ? 'de'
                      : null;

    // Always load base (Russian)
    const baseData = await fetch('sections/' + id + '.json').then(function (r) {
        return r.json();
    });

    // Try to load translation if needed
    let transData = null;
    if (transFolder) {
        try {
            transData = await fetch('translations/' + transFolder + '/' + id + '.json')
                .then(function (r) { return r.json(); });
        } catch (e) {
            transData = null;
        }
    }

    renderSection(baseData, transData);
    renderSidebar();
    updateProgressBar();
}

// ===== RENDER SECTION =====

function renderSection(baseData, transData) {
    contentArea.innerHTML = '';

    const isDual = langMode.includes('-');

    if (isDual) {
        // Two-column: Russian on left, translation on right
        const wrapper = document.createElement('div');
        wrapper.className = 'lang-dual';

        const leftCol = document.createElement('div');
        leftCol.className = 'lang-col';
        renderTitle(leftCol, baseData.title);
        renderContentBlocks(leftCol, baseData.content);

        const rightCol = document.createElement('div');
        rightCol.className = 'lang-col lang-col-right';
        const rightData = transData || baseData;
        renderTitle(rightCol, rightData.title);
        renderContentBlocks(rightCol, rightData.content);

        wrapper.appendChild(leftCol);
        wrapper.appendChild(rightCol);
        contentArea.appendChild(wrapper);

        // Sources and quiz from base (Russian) in dual mode
        if (baseData.sources) renderSources(baseData.sources);
        if (baseData.quiz)    renderQuiz(baseData);

    } else {
        // Single column
        // For non-Russian modes: use translation if available, else fall back to base
        const displayData = (langMode !== 'ru' && transData) ? transData : baseData;

        const col = document.createElement('div');
        col.className = 'lang-col';
        renderTitle(col, displayData.title);
        renderContentBlocks(col, displayData.content);
        contentArea.appendChild(col);

        if (displayData.sources) renderSources(displayData.sources);
        if (displayData.quiz)    renderQuiz(displayData);
    }
}

// ===== RENDER TITLE =====

function renderTitle(container, title) {
    if (!title) return;
    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = title;
    container.appendChild(h2);
}

// ===== RENDER CONTENT BLOCKS =====

function renderContentBlocks(container, blocks) {
    if (!blocks) return;
    blocks.forEach(function (block) {
        if (block.type === 'paragraph') {
            const p = document.createElement('p');
            p.textContent = block.text;
            container.appendChild(p);
        } else if (block.type === 'quote') {
            const bq = document.createElement('blockquote');
            bq.textContent = block.text;
            container.appendChild(bq);
        } else if (block.type === 'list') {
            const ul = document.createElement('ul');
            ul.className = 'intro-list';
            block.items.forEach(function (item) {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        }
    });
}

// ===== RENDER SOURCES =====

function renderSources(sources) {
    sources.forEach(function (source) {
        const block = document.createElement('div');
        block.className = 'source-block';

        const header = document.createElement('div');
        header.className = 'source-header';
        header.textContent = source.title;

        const body = document.createElement('div');
        body.className = 'source-body';
        body.textContent = source.text;

        header.addEventListener('click', function () {
            body.classList.toggle('open');
            block.classList.toggle('open');
        });

        block.appendChild(header);
        block.appendChild(body);
        contentArea.appendChild(block);
    });
}

// ===== RENDER QUIZ =====

function renderQuiz(sectionData) {
    const card = document.createElement('section');
    card.className = 'quiz-card';

    const header = document.createElement('div');
    header.className = 'quiz-header';
    header.textContent = I18N.t('quizHeader', langMode);

    const body = document.createElement('div');
    body.className = 'quiz-body open';

    header.addEventListener('click', function () {
        body.classList.toggle('open');
    });

    card.appendChild(header);
    card.appendChild(body);

    // Render each question
    sectionData.quiz.questions.forEach(function (q, qIndex) {
        const qDiv = document.createElement('div');
        qDiv.className = 'question';

        const p = document.createElement('p');
        p.textContent = q.question;
        qDiv.appendChild(p);

        q.options.forEach(function (option) {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'q_' + qIndex;
            input.dataset.correct = option.correct ? 'true' : 'false';
            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + option.text));
            qDiv.appendChild(label);
        });

        body.appendChild(qDiv);
    });

    // Result message
    const result = document.createElement('div');
    result.className = 'quiz-result';
    body.appendChild(result);

    // Submit button
    const btn = document.createElement('button');
    btn.className = 'quiz-submit';
    btn.textContent = I18N.t('quizSubmit', langMode);
    btn.addEventListener('click', function () {
        checkQuiz(sectionData.id, card);
    });
    body.appendChild(btn);

    contentArea.appendChild(card);

    // If section already completed — collapse and show message
    if (state.completedSections.includes(sectionData.id)) {
        body.classList.remove('open');
        result.textContent = I18N.t('quizAlreadyDone', langMode);
        result.style.color = 'green';
    }
}

// ===== CHECK QUIZ =====

function checkQuiz(sectionId, card) {
    const questions = card.querySelectorAll('.question');
    const result = card.querySelector('.quiz-result');
    let allCorrect = true;

    questions.forEach(function (qDiv) {
        const inputs = qDiv.querySelectorAll('input');

        // Reset colors
        inputs.forEach(function (inp) {
            inp.parentElement.style.color = '';
        });

        const checked = qDiv.querySelector('input:checked');

        if (!checked || checked.dataset.correct !== 'true') {
            allCorrect = false;
        }

        // Highlight correct answer green
        inputs.forEach(function (inp) {
            if (inp.dataset.correct === 'true') {
                inp.parentElement.style.color = 'green';
            }
        });

        // Highlight wrong selection red
        if (checked && checked.dataset.correct !== 'true') {
            checked.parentElement.style.color = 'red';
        }
    });

    if (allCorrect) {
        result.textContent = I18N.t('quizAllCorrect', langMode);
        result.style.color = 'green';

        if (!state.completedSections.includes(sectionId)) {
            state.completedSections.push(sectionId);
            saveProgress();
        }

        updateProgressBar();
        renderSidebar();

        card.querySelector('.quiz-body').classList.remove('open');

    } else {
        result.textContent = I18N.t('quizHasErrors', langMode);
        result.style.color = 'red';
    }
}

// ===== ESTHER SCROLL =====

function getEstherPDFs() {
    if (langMode === 'ru-de') {
        return [
            { file: 'pdfs/esther-ru-de-1.pdf', label: I18N.t('estherPart1', langMode) },
            { file: 'pdfs/esther-ru-de-2.pdf', label: I18N.t('estherPart2', langMode) }
        ];
    }
    if (langMode === 'ru-uk' || langMode === 'uk') {
        return [
            { file: 'pdfs/esther-ru-uk-1.pdf', label: I18N.t('estherPart1', langMode) },
            { file: 'pdfs/esther-ru-uk-2.pdf', label: I18N.t('estherPart2', langMode) }
        ];
    }
    if (langMode === 'de') {
        return [
            { file: 'pdfs/esther-de.pdf', label: '' }
        ];
    }
    // Default: Russian
    return [
        { file: 'pdfs/esther-ru.pdf', label: '' }
    ];
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

    const iframe = document.createElement('iframe');
    iframe.src = pdf.file;
    iframe.className = 'esther-iframe';
    iframe.title = pdf.label || I18N.sectionTitle('esther_scroll', langMode);
    block.appendChild(iframe);

    return block;
}

function renderEstherScroll() {
    contentArea.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('esther_scroll', langMode);
    contentArea.appendChild(h2);

    const desc = document.createElement('p');
    desc.className = 'esther-desc';
    desc.textContent = I18N.t('estherDesc', langMode);
    contentArea.appendChild(desc);

    const pdfs = getEstherPDFs();

    pdfs.forEach(function (pdf) {
        contentArea.appendChild(buildEstherPdfBlock(pdf));
    });
}

// ===== TZEDAKA / DONATE SECTION =====

function renderTzedaka() {
    contentArea.innerHTML = '';

    const uiLang = langMode === 'uk' ? 'uk' : (langMode === 'de' ? 'de' : 'ru');

    const strings = {
        ru: {
            title:      'Дать Цдаку',
            intro:      'Давать Цдаку (пожертвование) — одна из главных заповедей праздника Пурим. В этот день принято поддерживать еврейские общины, которые несут свет Торы. Ваш вклад имеет значение.',
            btn:        'Пожертвовать',
            viennaName: 'Еврейская община Вены',
            viennaOrg:  'JRCV',
            viennaDesc: 'Поддержите еврейскую общину Вены — одну из старейших и активных общин Европы, объединяющую сотни семей.',
            dniproName: 'Еврейская община Днепра',
            dniproOrg:  '',
            dniproDesc: 'Поддержите еврейскую общину Днепра — живой центр еврейской жизни на Украине.'
        },
        uk: {
            title:      'Дати Цдаку',
            intro:      'Давати Цдаку (пожертву) — одна з головних заповідей свята Пурим. Цього дня прийнято підтримувати єврейські громади, які несуть світло Тори. Ваш внесок має значення.',
            btn:        'Пожертвувати',
            viennaName: 'Єврейська громада Відня',
            viennaOrg:  'JRCV',
            viennaDesc: 'Підтримайте єврейську громаду Відня — одну з найстаріших та активних громад Європи, що об\'єднує сотні родин.',
            dniproName: 'Єврейська громада Дніпра',
            dniproOrg:  '',
            dniproDesc: 'Підтримайте єврейську громаду Дніпра — живий центр єврейського життя в Україні.'
        },
        de: {
            title:      'Zedaka geben',
            intro:      'Zedaka zu geben ist eines der wichtigsten Gebote von Purim. An diesem Tag ist es üblich, jüdische Gemeinden zu unterstützen, die das Licht der Tora tragen. Ihr Beitrag ist bedeutsam.',
            btn:        'Spenden',
            viennaName: 'Jüdische Gemeinde Wien',
            viennaOrg:  'JRCV',
            viennaDesc: 'Unterstützen Sie die Jüdische Gemeinde Wien — eine der ältesten und aktivsten Gemeinden Europas, die Hunderte von Familien vereint.',
            dniproName: 'Jüdische Gemeinde Dnipro',
            dniproOrg:  '',
            dniproDesc: 'Unterstützen Sie die Jüdische Gemeinde Dnipro — das lebendige Zentrum des jüdischen Lebens in der Ukraine.'
        }
    };

    var s = strings[uiLang];

    var h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = s.title;
    contentArea.appendChild(h2);

    var intro = document.createElement('p');
    intro.className = 'donate-intro';
    intro.textContent = s.intro;
    contentArea.appendChild(intro);

    var grid = document.createElement('div');
    grid.className = 'donate-grid';

    grid.appendChild(buildDonateCard({
        flag:     '\uD83C\uDDE6\uD83C\uDDF9',
        name:     s.viennaName,
        org:      s.viennaOrg,
        desc:     s.viennaDesc,
        btnText:  s.btn,
        href:     'https://donate.stripe.com/cN2dRw8b31T4gHm7ss'
    }));

    grid.appendChild(buildDonateCard({
        flag:     '\uD83C\uDDFA\uD83C\uDDE6',
        name:     s.dniproName,
        org:      s.dniproOrg,
        desc:     s.dniproDesc,
        btnText:  s.btn,
        href:     'https://www.portmone.com.ua/r3/pg/4ly2syh1dc00g4gccwg0ccgcokc4sw4?is=30303332462499f3524caf64bc3b954adcc10cef9c3c28a8e07730c61c0428d7a7e1b61150eb83427f46b0af&py=&h=ce774ffda6f170c231868393413f22d7'
    }));

    contentArea.appendChild(grid);
}

function buildDonateCard(opts) {
    var card = document.createElement('div');
    card.className = 'donate-card';

    // Header
    var header = document.createElement('div');
    header.className = 'donate-card-header';

    var flag = document.createElement('div');
    flag.className = 'donate-card-flag';
    flag.textContent = opts.flag;
    header.appendChild(flag);

    var name = document.createElement('h3');
    name.className = 'donate-card-name';
    name.textContent = opts.name;
    header.appendChild(name);

    if (opts.org) {
        var org = document.createElement('p');
        org.className = 'donate-card-org';
        org.textContent = opts.org;
        header.appendChild(org);
    }

    card.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'donate-card-body';

    var desc = document.createElement('p');
    desc.className = 'donate-card-desc';
    desc.textContent = opts.desc;
    body.appendChild(desc);

    var btn = document.createElement('a');
    btn.className = 'donate-btn';
    btn.href = opts.href;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    var icon = document.createElement('span');
    icon.className = 'donate-btn-icon';
    icon.textContent = '\u2764\uFE0F';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(opts.btnText));

    body.appendChild(btn);
    card.appendChild(body);

    return card;
}

// ===== DREIDEL GAME =====

function renderDreidelGame() {
    contentArea.innerHTML = '';

    const uiLang = langMode === 'uk' ? 'uk' : (langMode === 'de' ? 'de' : 'ru');

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
            videoDesc:    'Авраам Фрид и Лиор Наркис — «И возрадуешься в праздник твой»'
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
            videoDesc:    'Авраам Фрід і Ліор Наркіс — «І зрадієш у свято твоє»'
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
            videoDesc:    'Avraham Fried und Lior Narkis — „Und du wirst fröhlich sein an deinem Fest"'
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

    // Scoreboard
    var scoreboard = document.createElement('div');
    scoreboard.className = 'dreidel-scoreboard';

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

    // Build the dreidel SVG-like shape with CSS
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
    statusMsg.textContent = s.yourTurn;
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

    function ensurePot(actor) {
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
        if (gs.spinning || gs.over) return;
        gs.spinning = true;

        var btn = document.getElementById('dreidel-spin-btn');
        btn.disabled = true;

        var fig = document.getElementById('dreidel-figure');
        var letterEl = document.getElementById('dreidel-letter');

        // Start spin animation
        fig.classList.add('spinning');

        setTimeout(function () {
            var result = randomSide();
            letterEl.textContent = result.letter;
            fig.classList.remove('spinning');
            gs.spinning = false;

            applyResult(result, isPlayer);

            if (!gs.over) {
                if (isPlayer) {
                    // Computer's turn after short delay
                    gs.isPlayerTurn = false;
                    document.getElementById('dreidel-status').textContent = s.compTurn;
                    setTimeout(function () { doSpin(false); }, 1200);
                } else {
                    // Back to player
                    gs.isPlayerTurn = true;
                    setTimeout(function () {
                        if (!gs.over) {
                            document.getElementById('dreidel-status').textContent = s.yourTurn;
                            document.getElementById('dreidel-spin-btn').disabled = false;
                        }
                    }, 900);
                }
            }
        }, 1800);
    }

    spinBtn.addEventListener('click', function () {
        if (!gs.spinning && !gs.over && gs.isPlayerTurn) {
            doSpin(true);
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
        document.getElementById('dreidel-status').textContent = s.yourTurn;
        document.getElementById('dreidel-spin-btn').disabled = false;
        updateDisplay();
    });
}

// ===== PROGRESS BAR =====

function updateProgressBar() {
    const quizSections = SECTIONS.filter(function (s) { return s.id !== 'intro' && s.type !== 'pdf'; });
    const total = quizSections.length;
    const done = state.completedSections.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    progressFill.style.width = pct + '%';
    progressPct.textContent = pct + '%';
}

// ===== STORAGE =====

function loadProgress() {
    const saved = localStorage.getItem('lessonProgress');
    if (saved) {
        state = JSON.parse(saved);
    }
}

function saveProgress() {
    localStorage.setItem('lessonProgress', JSON.stringify(state));
}
