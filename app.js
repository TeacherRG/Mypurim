// ===== CONFIG =====

const SECTIONS = [
    { id: 'intro'     },
    { id: 'section_a' },
    { id: 'section_b' },
    { id: 'section_c' }
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
});

// ===== SIDEBAR =====

function renderSidebar() {
    sidebarMenu.innerHTML = '';

    SECTIONS.forEach(function (section, index) {
        const li = document.createElement('li');
        li.textContent = I18N.sectionTitle(section.id, langMode);

        // Locking: intro and section_a are always accessible.
        // Each subsequent section requires the previous one to be completed.
        if (index >= 2) {
            const prevId = SECTIONS[index - 1].id;
            if (!state.completedSections.includes(prevId)) {
                li.classList.add('locked');
            }
        }

        if (state.completedSections.includes(section.id)) {
            li.classList.add('completed');
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

// ===== PROGRESS BAR =====

function updateProgressBar() {
    const quizSections = SECTIONS.filter(function (s) { return s.id !== 'intro'; });
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
