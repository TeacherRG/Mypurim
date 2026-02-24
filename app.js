// ===== CONFIG =====

const SECTIONS = [
    { id: 'intro'                                                          },
    { id: 'dvar_malchut',    type: 'group'                                },
    { id: 'section_a',       group: 'dvar_malchut'                        },
    { id: 'section_b',       group: 'dvar_malchut'                        },
    { id: 'section_c',       group: 'dvar_malchut'                        },
    { id: 'halacha',         type: 'halacha'                              },
    { id: 'megilla_read',    type: 'group'                                },
    { id: 'esther_scroll',   type: 'pdf',      group: 'megilla_read'     },
    { id: 'maharash_scroll', type: 'maharash', group: 'megilla_read'     },
    { id: 'tzedaka',         type: 'donate'                               },
    { id: 'games',           type: 'group'                                },
    { id: 'dreidel',         type: 'game',     group: 'games'            },
    { id: 'hangman',         type: 'hangman',  group: 'games'            },
    { id: 'spiral',          type: 'spiral',   group: 'games'            },
    { id: 'alcohol',         type: 'alcohol',  group: 'games'            }
];

// ===== STATE =====

function detectBrowserLang() {
    var langs = (navigator.languages && navigator.languages.length)
        ? Array.from(navigator.languages)
        : [navigator.language || 'ru'];
    for (var i = 0; i < langs.length; i++) {
        var l = langs[i].toLowerCase();
        if (l.startsWith('uk')) return 'uk';
        if (l.startsWith('de')) return 'de';
        if (l.startsWith('he') || l.startsWith('iw')) return 'he';
        if (l.startsWith('ru')) return 'ru';
    }
    return 'ru';
}

let currentId = null;
let langMode = localStorage.getItem('langMode') || detectBrowserLang();
let state = { completedSections: [] };
let collapsedGroups = new Set(['dvar_malchut', 'megilla_read', 'games']);
var _spiralToken = null;

// ===== DOM REFS =====

const sidebarMenu   = document.getElementById('sidebar-menu');
const contentArea   = document.getElementById('content');
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
    var initialHash = window.location.hash.slice(1);
    var validInitial = SECTIONS.find(function (s) { return s.id === initialHash; });
    loadSection(validInitial ? initialHash : 'intro');
    initMusicPlayer();

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

    // Auto-expand the group containing the currently active section
    const currentSection = SECTIONS.find(function (s) { return s.id === currentId; });
    if (currentSection && currentSection.group) {
        collapsedGroups.delete(currentSection.group);
    }

    // Quiz sections only (no type), in order — used for locking logic
    const quizSections = SECTIONS.filter(function (s) { return !s.type; });

    SECTIONS.forEach(function (section) {
        // Skip sub-items whose group is currently collapsed
        if (section.group && collapsedGroups.has(section.group)) {
            return;
        }

        const li = document.createElement('li');

        // Group header — clickable accordion toggle
        if (section.type === 'group') {
            li.className = 'group-header';
            li.textContent = I18N.sectionTitle(section.id, langMode);
            const chevron = document.createElement('span');
            chevron.className = 'group-chevron';
            chevron.textContent = collapsedGroups.has(section.id) ? '▶' : '▼';
            li.appendChild(chevron);
            li.addEventListener('click', function () {
                if (collapsedGroups.has(section.id)) {
                    collapsedGroups.delete(section.id);
                } else {
                    collapsedGroups.add(section.id);
                }
                renderSidebar();
            });
            sidebarMenu.appendChild(li);
            return;
        }

        li.textContent = I18N.sectionTitle(section.id, langMode);

        if (section.group) {
            li.classList.add('sub-item');
        }

        // PDF, donate, halacha, maharash sections are always accessible — no quiz, no locking
        if (section.type === 'pdf') {
            li.classList.add('pdf-section');
        } else if (section.type === 'donate') {
            li.classList.add('donate-section');
        } else if (section.type === 'halacha') {
            li.classList.add('halacha-section-item');
        } else if (section.type === 'maharash') {
            li.classList.add('maharash-section-item');
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
    // Cancel any running spiral animation
    if (_spiralToken) { _spiralToken.cancelled = true; _spiralToken = null; }
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
    if (sectionCfg && sectionCfg.type === 'hangman') {
        renderHangmanSection();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'spiral') {
        renderSpiralGame();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'halacha') {
        renderHalacha();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'alcohol') {
        renderAlcoholCalculator();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'maharash') {
        renderMaharashScroll();
        renderSidebar();
        updateProgressBar();
        return;
    }

    // Determine translation language folder
    const transFolder = langMode === 'uk' || langMode === 'ru-uk' ? 'uk'
                      : langMode === 'de' || langMode === 'ru-de' ? 'de'
                      : langMode === 'he' ? 'he'
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
        renderTitle(leftCol, baseData.title, true);
        renderContentBlocks(leftCol, baseData.content);

        const rightCol = document.createElement('div');
        rightCol.className = 'lang-col lang-col-right';
        const rightData = transData || baseData;
        renderTitle(rightCol, rightData.title, false);
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

        // Hebrew with no translation file yet — show "בקרוב יהיה"
        if (langMode === 'he' && !transData) {
            const col = document.createElement('div');
            col.className = 'lang-col';
            renderTitle(col, baseData.title, true);
            const notice = document.createElement('div');
            notice.className = 'coming-soon-notice';
            notice.textContent = I18N.t('comingSoon', langMode);
            col.appendChild(notice);
            contentArea.appendChild(col);
            if (baseData.quiz) renderQuiz(baseData);
            return;
        }

        const col = document.createElement('div');
        col.className = 'lang-col';
        renderTitle(col, displayData.title, true);
        renderContentBlocks(col, displayData.content);
        contentArea.appendChild(col);

        if (displayData.sources) renderSources(displayData.sources);
        if (displayData.quiz)    renderQuiz(displayData);
    }
}

// ===== RENDER TITLE =====

function renderTitle(container, title, showShare) {
    if (!title) return;
    if (showShare) {
        const row = document.createElement('div');
        row.className = 'section-title-row';

        const h2 = document.createElement('h2');
        h2.className = 'section-title';
        h2.textContent = title;

        const btn = document.createElement('button');
        btn.className = 'share-btn';
        btn.title = I18N.t('shareCopied', langMode);
        btn.setAttribute('aria-label', 'Share');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
        btn.addEventListener('click', function () {
            shareSection(currentId);
        });

        row.appendChild(h2);
        row.appendChild(btn);
        container.appendChild(row);
    } else {
        const h2 = document.createElement('h2');
        h2.className = 'section-title';
        h2.textContent = title;
        container.appendChild(h2);
    }
}

// ===== SHARE =====

function shareSection(id) {
    const url = window.location.origin + window.location.pathname + '#' + id;
    if (navigator.share) {
        navigator.share({ url: url }).catch(function () {});
    } else {
        navigator.clipboard.writeText(url).then(function () {
            showShareToast();
        }).catch(function () {
            showShareToast();
        });
    }
}

function showShareToast() {
    var existing = document.querySelector('.share-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = I18N.t('shareCopied', langMode);
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.classList.add('fade-out');
        setTimeout(function () { toast.remove(); }, 300);
    }, 2000);
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
        return ['pdfs/ester-he.json'];
    }
    return ['pdfs/ester-ru.json'];
}

function renderEstherJSON(data, container) {
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

    const desc = document.createElement('p');
    desc.className = 'esther-desc';
    desc.textContent = I18N.t('estherDesc', langMode);
    contentArea.appendChild(desc);

    const pdfs = getEstherPDFs();
    const jsonFiles = getEstherJSONs();

    if (jsonFiles.length === 1) {
        pdfs.forEach(function (pdf) {
            contentArea.appendChild(buildEstherPdfBlock(pdf));
        });
        const container = document.createElement('div');
        container.className = 'esther-text-container';
        contentArea.appendChild(container);
        fetch(jsonFiles[0])
            .then(function (r) {
                if (!r.ok) throw new Error('not found');
                return r.json();
            })
            .then(function (data) { renderEstherJSON(data, container); })
            .catch(function () {
                const notice = document.createElement('div');
                notice.className = 'coming-soon-notice';
                notice.textContent = I18N.t('comingSoon', langMode);
                container.appendChild(notice);
            });
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
            fetch(file)
                .then(function (r) { return r.json(); })
                .then(function (data) { renderEstherJSON(data, textContainer); });
        });
    }
}

// ===== MAHARASH SCROLL VIEWER =====

function renderMaharashScroll() {
    contentArea.innerHTML = '';

    const IMAGES = Array.from({ length: 11 }, function (_, i) {
        return 'pdfs/Maharash/Megila' + (i + 1) + '.jpg';
    });

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('maharash_scroll', langMode);
    contentArea.appendChild(h2);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'maharash-toolbar';

    const pageCounter = document.createElement('span');
    pageCounter.className = 'maharash-page-counter';
    pageCounter.textContent = '1 / 11';
    toolbar.appendChild(pageCounter);

    const zoomOut = document.createElement('button');
    zoomOut.className = 'maharash-zoom-btn';
    zoomOut.textContent = '−';
    zoomOut.title = 'Уменьшить / Zoom out';

    const zoomIn = document.createElement('button');
    zoomIn.className = 'maharash-zoom-btn';
    zoomIn.textContent = '+';
    zoomIn.title = 'Увеличить / Zoom in';

    toolbar.appendChild(zoomOut);
    toolbar.appendChild(zoomIn);

    const fsBtn = document.createElement('button');
    fsBtn.className = 'maharash-fs-btn';
    fsBtn.title = 'Полный экран / Fullscreen';
    fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    toolbar.appendChild(fsBtn);

    contentArea.appendChild(toolbar);

    // Scroll container
    const viewer = document.createElement('div');
    viewer.className = 'maharash-viewer';
    contentArea.appendChild(viewer);

    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'maharash-nav maharash-nav-prev';
    prevBtn.innerHTML = '&#8249;';
    prevBtn.title = 'Предыдущая страница';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'maharash-nav maharash-nav-next';
    nextBtn.innerHTML = '&#8250;';
    nextBtn.title = 'Следующая страница';

    viewer.appendChild(prevBtn);

    // Image strip
    const strip = document.createElement('div');
    strip.className = 'maharash-strip';
    viewer.appendChild(strip);

    viewer.appendChild(nextBtn);

    IMAGES.forEach(function (src, idx) {
        const slide = document.createElement('div');
        slide.className = 'maharash-slide';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Мегила Махараш, страница ' + (idx + 1);
        img.className = 'maharash-img';
        img.loading = idx === 0 ? 'eager' : 'lazy';

        slide.appendChild(img);
        strip.appendChild(slide);
    });

    // State
    let currentPage = 0;
    let zoomLevel = 1;

    function applyZoom() {
        const imgs = strip.querySelectorAll('.maharash-img');
        for (var z = 0; z < imgs.length; z++) { imgs[z].style.transform = ''; }
        if (imgs[currentPage] && zoomLevel !== 1) {
            imgs[currentPage].style.transform = 'scale(' + zoomLevel + ')';
            imgs[currentPage].style.transformOrigin = 'center';
        }
        zoomIn.disabled = zoomLevel >= 4;
        zoomOut.disabled = zoomLevel <= 0.5;
    }

    zoomOut.addEventListener('click', function () {
        zoomLevel = Math.max(0.5, +(zoomLevel - 0.5).toFixed(1));
        applyZoom();
    });
    zoomIn.addEventListener('click', function () {
        zoomLevel = Math.min(4, +(zoomLevel + 0.5).toFixed(1));
        applyZoom();
    });

    function goTo(idx) {
        currentPage = Math.max(0, Math.min(IMAGES.length - 1, idx));
        strip.style.transform = 'translateX(-' + (currentPage * 100) + '%)';
        pageCounter.textContent = (currentPage + 1) + ' / ' + IMAGES.length;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === IMAGES.length - 1;
        zoomLevel = 1;
        applyZoom();
    }

    goTo(0);

    prevBtn.addEventListener('click', function () { goTo(currentPage - 1); });
    nextBtn.addEventListener('click', function () { goTo(currentPage + 1); });

    // Keyboard navigation
    function onKey(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { goTo(currentPage + 1); e.preventDefault(); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { goTo(currentPage - 1); e.preventDefault(); }
        if (e.key === '+' || e.key === '=') { zoomLevel = Math.min(4, +(zoomLevel + 0.5).toFixed(1)); applyZoom(); e.preventDefault(); }
        if (e.key === '-') { zoomLevel = Math.max(0.5, +(zoomLevel - 0.5).toFixed(1)); applyZoom(); e.preventDefault(); }
        if (e.key === 'Escape' && document.fullscreenElement) { document.exitFullscreen(); }
    }
    document.addEventListener('keydown', onKey);

    // Touch/swipe support
    var touchStartX = null;
    strip.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    strip.addEventListener('touchend', function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { goTo(currentPage + (dx < 0 ? 1 : -1)); }
        touchStartX = null;
    }, { passive: true });

    // Fullscreen
    fsBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            viewer.requestFullscreen().catch(function () {});
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', function updateFsIcon() {
        if (document.fullscreenElement === viewer) {
            fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
            viewer.classList.add('maharash-fullscreen-active');
        } else {
            fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
            viewer.classList.remove('maharash-fullscreen-active');
        }
    });

    // Cleanup keyboard listener when section changes
    var origLoadSection = loadSection;
    viewer.dataset.keyCleanup = 'pending';
    var cleanupOnce = function () {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('fullscreenchange', cleanupOnce);
    };
    contentArea.addEventListener('maharash-cleanup', cleanupOnce, { once: true });
}

// ===== HALACHA SECTION =====

function getHalachaFile(lang) {
    if (lang === 'uk') return 'Halacha/halacha-uk.json';
    if (lang === 'de') return 'Halacha/halacha-de.json';
    if (lang === 'he') return 'Halacha/halacha-he.json';
    return 'Halacha/halacha-ru.json';
}

async function renderHalacha() {
    contentArea.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('halacha', langMode);
    contentArea.appendChild(h2);

    const isDual = langMode.includes('-');

    if (isDual) {
        const lang2 = langMode.split('-')[1]; // 'uk' or 'de'
        const results = await Promise.all([
            fetch(getHalachaFile('ru')).then(function (r) { return r.json(); }),
            fetch(getHalachaFile(lang2)).then(function (r) { return r.json(); })
        ]);
        const dataRu = results[0];
        const dataLang = results[1];

        const dual = document.createElement('div');
        dual.className = 'lang-dual';
        contentArea.appendChild(dual);

        const leftCol = document.createElement('div');
        leftCol.className = 'lang-col';
        renderHalachaData(leftCol, dataRu);
        dual.appendChild(leftCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'lang-col lang-col-right';
        renderHalachaData(rightCol, dataLang);
        dual.appendChild(rightCol);
    } else {
        var lang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';
        try {
            const resp = await fetch(getHalachaFile(lang));
            if (!resp.ok) throw new Error('not found');
            const data = await resp.json();
            const col = document.createElement('div');
            col.className = 'lang-col';
            renderHalachaData(col, data);
            contentArea.appendChild(col);
        } catch (e) {
            const notice = document.createElement('div');
            notice.className = 'coming-soon-notice';
            notice.textContent = I18N.t('comingSoon', langMode);
            contentArea.appendChild(notice);
        }
    }
}

function renderHalachaData(container, data) {
    // Show meta: calendar/title and source
    const metaTitle = data.calendar_cycle || data.titel || data['назва'] || '';
    const metaSource = data.source_material || data.herausgeber || data['видавництво'] || '';
    if (metaTitle || metaSource) {
        const meta = document.createElement('p');
        meta.className = 'halacha-meta';
        meta.textContent = [metaTitle, metaSource].filter(Boolean).join(' — ');
        container.appendChild(meta);
    }

    // Get the main schedule list/object
    const schedule = data.schedule || data.gesetze || data['закони'];
    if (Array.isArray(schedule)) {
        schedule.forEach(function (day) { renderHalachaDay(container, day); });
    } else if (schedule && typeof schedule === 'object') {
        Object.values(schedule).forEach(function (day) { renderHalachaDay(container, day); });
    }

    // Extras: special_instructions_for_mivtzoim (RU) or wichtige_notiz (DE)
    var extras = data.special_instructions_for_mivtzoim || data.wichtige_notiz;
    if (extras) {
        var extraDiv = document.createElement('div');
        extraDiv.className = 'halacha-extras';
        renderHalachaNode(extraDiv, extras);
        container.appendChild(extraDiv);
    }
}

function renderHalachaDay(container, day) {
    var eventName = day.event || day.ereignis || day['\u043f\u043e\u0434\u0456\u044f'] || '';
    var dateName  = day['\u0434\u0430\u0442\u0430'] || day.datum || '';
    var label = [dateName, eventName].filter(Boolean).join(' — ');

    var section = document.createElement('div');
    section.className = 'halacha-day';

    var header = document.createElement('div');
    header.className = 'halacha-day-header';
    header.textContent = label;

    var body = document.createElement('div');
    body.className = 'halacha-day-body open';

    header.addEventListener('click', function () {
        body.classList.toggle('open');
        section.classList.toggle('collapsed');
    });

    // Render each sub-property, skipping the event/date keys
    var skipKeys = ['event', 'ereignis', '\u043f\u043e\u0434\u0456\u044f', '\u0434\u0430\u0442\u0430', 'datum'];
    Object.entries(day).forEach(function (entry) {
        var key = entry[0];
        var value = entry[1];
        if (skipKeys.includes(key)) return;
        var topicDiv = document.createElement('div');
        topicDiv.className = 'halacha-topic';
        var topicHead = document.createElement('h4');
        topicHead.className = 'halacha-topic-head';
        topicHead.textContent = key.replace(/_/g, ' ');
        topicDiv.appendChild(topicHead);
        renderHalachaNode(topicDiv, value);
        body.appendChild(topicDiv);
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
}

function renderHalachaNode(container, value) {
    if (typeof value === 'string') {
        var p = document.createElement('p');
        p.className = 'halacha-text';
        p.textContent = value;
        container.appendChild(p);
    } else if (Array.isArray(value)) {
        var ul = document.createElement('ul');
        ul.className = 'halacha-list';
        value.forEach(function (item) {
            var li = document.createElement('li');
            if (typeof item === 'string') {
                li.textContent = item;
            } else {
                renderHalachaNode(li, item);
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
    } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(function (entry) {
            var key = entry[0];
            var val = entry[1];
            var sub = document.createElement('div');
            sub.className = 'halacha-sub';
            var subHead = document.createElement('h5');
            subHead.className = 'halacha-sub-head';
            subHead.textContent = key.replace(/_/g, ' ');
            sub.appendChild(subHead);
            renderHalachaNode(sub, val);
            container.appendChild(sub);
        });
    }
}

// ===== TZEDAKA / DONATE SECTION =====

function renderTzedaka() {
    contentArea.innerHTML = '';

    const uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

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
        },
        he: {
            title:      'תן צדקה',
            intro:      'נתינת צדקה היא אחת המצוות המרכזיות של חג הפורים. ביום זה נהוג לתמוך בקהילות יהודיות הנושאות את אור התורה. תרומתכם משמעותית.',
            btn:        'תרום',
            viennaName: 'הקהילה היהודית בווינה',
            viennaOrg:  'JRCV',
            viennaDesc: 'תמכו בקהילה היהודית בווינה — אחת הקהילות העתיקות והפעילות ביותר באירופה, המאגדת מאות משפחות.',
            dniproName: 'הקהילה היהודית בדניפרו',
            dniproOrg:  '',
            dniproDesc: 'תמכו בקהילה היהודית בדניפרו — המרכז החי של החיים היהודיים באוקראינה.'
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

// ===== HANGMAN GAME =====

function renderHangmanSection() {
    contentArea.innerHTML = '';

    // Section title
    const titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('hangman', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    // Game container
    const gameEl = document.createElement('div');
    gameEl.id = 'hangman-game-root';
    contentArea.appendChild(gameEl);

    HangmanGame.render(gameEl, langMode);
}

// ===== ALCOHOL CALCULATOR =====

function renderAlcoholCalculator() {
    contentArea.innerHTML = '';

    var uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

    var strings = {
        ru: {
            title:       'Алкогольный калькулятор',
            desc:        'Отслеживайте содержание алкоголя в крови и уровень трезвости на основе признанной во всём мире формулы Видмарка. Просто введите количество выпитого спиртного и позвольте приложению рассчитать содержание алкоголя в крови и уровень вашего опьянения. Оставайтесь безопасным и ответственным, хорошо проводя время.',
            yourData:    'Ваши данные',
            genderLabel: 'Пол',
            male:        'Мужской',
            female:      'Женский',
            weightLabel: 'Вес (кг)',
            drinksLabel: 'Выпитое',
            addDrink:    '+ Добавить напиток',
            timeLabel:   'Время с начала употребления (часов)',
            calcBtn:     'Рассчитать',
            resultTitle: 'Результат',
            bacLabel:    'Алкоголь в крови',
            levelLabel:  'Уровень опьянения',
            soberLabel:  'До полного отрезвления',
            soberHours:  'ч',
            levels: [
                { max: 0.3,        text: 'Трезвый',                   color: '#4caf50' },
                { max: 0.5,        text: 'Незначительное влияние',     color: '#8bc34a' },
                { max: 1.0,        text: 'Лёгкое опьянение',           color: '#f9c74f' },
                { max: 1.5,        text: 'Умеренное опьянение',        color: '#ff9800' },
                { max: 2.0,        text: 'Сильное опьянение',          color: '#ff5722' },
                { max: 3.0,        text: 'Очень сильное / опасно',     color: '#f44336' },
                { max: Infinity,   text: 'Угроза жизни!',              color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Пиво (500 мл, 5%)',             ml: 500, pct: 5  },
                { label: 'Пиво (330 мл, 5%)',             ml: 330, pct: 5  },
                { label: 'Вино (150 мл, 12%)',            ml: 150, pct: 12 },
                { label: 'Шампанское (150 мл, 11%)',      ml: 150, pct: 11 },
                { label: 'Водка / крепкие (50 мл, 40%)', ml: 50,  pct: 40 },
                { label: 'Другой напиток...',             ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'мл',
            customPct:   '% алк.',
            noData:      'Пожалуйста, введите корректный вес (30–200 кг)',
            noDrinks:    'Добавьте хотя бы один напиток',
            disclaimer:  'Калькулятор носит исключительно информационный характер. Не садитесь за руль, пока уровень алкоголя в крови не достигнет 0,0 ‰. Будьте ответственны!',
            removeBtn:   'Удалить'
        },
        uk: {
            title:       'Алкогольний калькулятор',
            desc:        'Відстежуйте вміст алкоголю в крові та рівень тверезості на основі визнаної в усьому світі формули Відмарка. Просто введіть кількість випитого спиртного і дозвольте застосунку розрахувати вміст алкоголю в крові та рівень вашого сп\'яніння. Залишайтеся безпечним і відповідальним, добре проводячи час.',
            yourData:    'Ваші дані',
            genderLabel: 'Стать',
            male:        'Чоловіча',
            female:      'Жіноча',
            weightLabel: 'Вага (кг)',
            drinksLabel: 'Випито',
            addDrink:    '+ Додати напій',
            timeLabel:   'Час з початку вживання (годин)',
            calcBtn:     'Розрахувати',
            resultTitle: 'Результат',
            bacLabel:    'Алкоголь у крові',
            levelLabel:  'Рівень сп\'яніння',
            soberLabel:  'До повного протверезіння',
            soberHours:  'год',
            levels: [
                { max: 0.3,        text: 'Тверезий',                  color: '#4caf50' },
                { max: 0.5,        text: 'Незначний вплив',            color: '#8bc34a' },
                { max: 1.0,        text: 'Легке сп\'яніння',           color: '#f9c74f' },
                { max: 1.5,        text: 'Помірне сп\'яніння',         color: '#ff9800' },
                { max: 2.0,        text: 'Сильне сп\'яніння',          color: '#ff5722' },
                { max: 3.0,        text: 'Дуже сильне / небезпечно',  color: '#f44336' },
                { max: Infinity,   text: 'Загроза життю!',             color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Пиво (500 мл, 5%)',               ml: 500, pct: 5  },
                { label: 'Пиво (330 мл, 5%)',               ml: 330, pct: 5  },
                { label: 'Вино (150 мл, 12%)',              ml: 150, pct: 12 },
                { label: 'Шампанське (150 мл, 11%)',        ml: 150, pct: 11 },
                { label: 'Горілка / міцні (50 мл, 40%)',   ml: 50,  pct: 40 },
                { label: 'Інший напій...',                  ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'мл',
            customPct:   '% алк.',
            noData:      'Будь ласка, введіть коректну вагу (30–200 кг)',
            noDrinks:    'Додайте хоча б один напій',
            disclaimer:  'Калькулятор має виключно інформаційний характер. Не сідайте за кермо, поки рівень алкоголю в крові не досягне 0,0 ‰. Будьте відповідальні!',
            removeBtn:   'Видалити'
        },
        de: {
            title:       'Alkohol-Kalkulator',
            desc:        'Verfolgen Sie Ihren Blutalkoholgehalt und Nüchternheitsgrad basierend auf der weltweit anerkannten Widmark-Formel. Geben Sie einfach die Menge des konsumierten Alkohols ein und lassen Sie die App Ihren Blutalkoholgehalt und Rauschgrad berechnen. Bleiben Sie sicher und verantwortungsbewusst.',
            yourData:    'Ihre Daten',
            genderLabel: 'Geschlecht',
            male:        'Männlich',
            female:      'Weiblich',
            weightLabel: 'Gewicht (kg)',
            drinksLabel: 'Getränke',
            addDrink:    '+ Getränk hinzufügen',
            timeLabel:   'Zeit seit dem ersten Drink (Stunden)',
            calcBtn:     'Berechnen',
            resultTitle: 'Ergebnis',
            bacLabel:    'Blutalkohol (BAK)',
            levelLabel:  'Rauschgrad',
            soberLabel:  'Bis zur Nüchternheit',
            soberHours:  'Std.',
            levels: [
                { max: 0.3,        text: 'Nüchtern',                   color: '#4caf50' },
                { max: 0.5,        text: 'Geringfügiger Einfluss',      color: '#8bc34a' },
                { max: 1.0,        text: 'Leichte Trunkenheit',         color: '#f9c74f' },
                { max: 1.5,        text: 'Mäßige Trunkenheit',          color: '#ff9800' },
                { max: 2.0,        text: 'Starke Trunkenheit',          color: '#ff5722' },
                { max: 3.0,        text: 'Sehr stark / gefährlich',     color: '#f44336' },
                { max: Infinity,   text: 'Lebensgefahr!',               color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Bier (500 ml, 5%)',              ml: 500, pct: 5  },
                { label: 'Bier (330 ml, 5%)',              ml: 330, pct: 5  },
                { label: 'Wein (150 ml, 12%)',             ml: 150, pct: 12 },
                { label: 'Sekt (150 ml, 11%)',             ml: 150, pct: 11 },
                { label: 'Vodka / Schnaps (50 ml, 40%)',   ml: 50,  pct: 40 },
                { label: 'Anderes Getränk...',             ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'ml',
            customPct:   '% Alk.',
            noData:      'Bitte geben Sie ein gültiges Gewicht ein (30–200 kg)',
            noDrinks:    'Bitte fügen Sie mindestens ein Getränk hinzu',
            disclaimer:  'Dieser Rechner dient nur zu Informationszwecken. Fahren Sie kein Fahrzeug, bis Ihr BAK 0,0 ‰ erreicht. Bleiben Sie verantwortungsbewusst!',
            removeBtn:   'Löschen'
        },
        he: {
            title:       'מחשבון אלכוהול',
            desc:        'עקוב אחר רמת האלכוהול בדם ומידת הפיכחון על בסיס נוסחת וידמארק המוכרת בעולם. הזן את כמות המשקאות האלכוהוליים שצרכת ותן לאפליקציה לחשב את רמת האלכוהול בדמך ומידת השכרות שלך. הישאר בטוח ואחראי.',
            yourData:    'הנתונים שלך',
            genderLabel: 'מין',
            male:        'זכר',
            female:      'נקבה',
            weightLabel: 'משקל (ק"ג)',
            drinksLabel: 'שתייה',
            addDrink:    '+ הוסף משקה',
            timeLabel:   'זמן מתחילת השתייה (שעות)',
            calcBtn:     'חשב',
            resultTitle: 'תוצאה',
            bacLabel:    'אלכוהול בדם',
            levelLabel:  'רמת שכרות',
            soberLabel:  'עד להתפכחות מלאה',
            soberHours:  'שע׳',
            levels: [
                { max: 0.3,        text: 'פיכח',                        color: '#4caf50' },
                { max: 0.5,        text: 'השפעה קלה',                   color: '#8bc34a' },
                { max: 1.0,        text: 'שכרות קלה',                   color: '#f9c74f' },
                { max: 1.5,        text: 'שכרות מתונה',                 color: '#ff9800' },
                { max: 2.0,        text: 'שכרות חזקה',                  color: '#ff5722' },
                { max: 3.0,        text: 'שכרות חמורה / מסוכן',        color: '#f44336' },
                { max: Infinity,   text: 'סכנת חיים!',                  color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'בירה (500 מ"ל, 5%)',               ml: 500, pct: 5  },
                { label: 'בירה (330 מ"ל, 5%)',               ml: 330, pct: 5  },
                { label: 'יין (150 מ"ל, 12%)',               ml: 150, pct: 12 },
                { label: 'שמפניה (150 מ"ל, 11%)',            ml: 150, pct: 11 },
                { label: 'וודקה / חריפים (50 מ"ל, 40%)',    ml: 50,  pct: 40 },
                { label: 'משקה אחר...',                      ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'מ"ל',
            customPct:   '% אלכ.',
            noData:      'אנא הזן משקל תקין (30–200 ק"ג)',
            noDrinks:    'הוסף לפחות משקה אחד',
            disclaimer:  'המחשבון מיועד למטרות מידע בלבד. אל תנהג עד שרמת האלכוהול בדמך תגיע ל-0.0 ‰. היה אחראי!',
            removeBtn:   'הסר'
        }
    };

    var s = strings[uiLang];

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + s.title + '</h1>';
    contentArea.appendChild(titleBar);

    // Description
    var desc = document.createElement('p');
    desc.className = 'alcohol-desc';
    desc.textContent = s.desc;
    contentArea.appendChild(desc);

    // Main card
    var card = document.createElement('div');
    card.className = 'alcohol-card';
    contentArea.appendChild(card);

    // ─── Personal data ───────────────────────────────────────────
    var personalSection = document.createElement('div');
    personalSection.className = 'alcohol-section';

    var personalTitle = document.createElement('h3');
    personalTitle.className = 'alcohol-section-title';
    personalTitle.textContent = s.yourData;
    personalSection.appendChild(personalTitle);

    // Gender selector
    var genderRow = document.createElement('div');
    genderRow.className = 'alcohol-row';

    var genderLabelEl = document.createElement('label');
    genderLabelEl.className = 'alcohol-label';
    genderLabelEl.textContent = s.genderLabel;
    genderRow.appendChild(genderLabelEl);

    var genderBtns = document.createElement('div');
    genderBtns.className = 'alcohol-gender-btns';

    var selectedGender = 'male';

    var maleBtn = document.createElement('button');
    maleBtn.className = 'alcohol-gender-btn active';
    maleBtn.type = 'button';
    maleBtn.textContent = s.male;

    var femaleBtn = document.createElement('button');
    femaleBtn.className = 'alcohol-gender-btn';
    femaleBtn.type = 'button';
    femaleBtn.textContent = s.female;

    maleBtn.addEventListener('click', function () {
        selectedGender = 'male';
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    });
    femaleBtn.addEventListener('click', function () {
        selectedGender = 'female';
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    });

    genderBtns.appendChild(maleBtn);
    genderBtns.appendChild(femaleBtn);
    genderRow.appendChild(genderBtns);
    personalSection.appendChild(genderRow);

    // Weight input
    var weightRow = document.createElement('div');
    weightRow.className = 'alcohol-row';

    var weightLabelEl = document.createElement('label');
    weightLabelEl.className = 'alcohol-label';
    weightLabelEl.textContent = s.weightLabel;

    var weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.className = 'alcohol-input';
    weightInput.min = '30';
    weightInput.max = '200';
    weightInput.placeholder = '70';

    weightRow.appendChild(weightLabelEl);
    weightRow.appendChild(weightInput);
    personalSection.appendChild(weightRow);
    card.appendChild(personalSection);

    // ─── Drinks ──────────────────────────────────────────────────
    var drinksSection = document.createElement('div');
    drinksSection.className = 'alcohol-section';

    var drinksSectionTitle = document.createElement('h3');
    drinksSectionTitle.className = 'alcohol-section-title';
    drinksSectionTitle.textContent = s.drinksLabel;
    drinksSection.appendChild(drinksSectionTitle);

    var drinksList = document.createElement('div');
    drinksList.className = 'alcohol-drinks-list';
    drinksSection.appendChild(drinksList);

    var addDrinkBtn = document.createElement('button');
    addDrinkBtn.className = 'alcohol-add-btn';
    addDrinkBtn.type = 'button';
    addDrinkBtn.textContent = s.addDrink;
    drinksSection.appendChild(addDrinkBtn);

    function addDrinkRow() {
        var drinkRow = document.createElement('div');
        drinkRow.className = 'alcohol-drink-row';

        var typeSelect = document.createElement('select');
        typeSelect.className = 'alcohol-drink-select';
        s.drinkTypes.forEach(function (dt, idx) {
            var opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = dt.label;
            typeSelect.appendChild(opt);
        });

        var customMlInput = document.createElement('input');
        customMlInput.type = 'number';
        customMlInput.className = 'alcohol-drink-custom';
        customMlInput.placeholder = s.customMl;
        customMlInput.min = '1';
        customMlInput.max = '2000';
        customMlInput.style.display = 'none';

        var customPctInput = document.createElement('input');
        customPctInput.type = 'number';
        customPctInput.className = 'alcohol-drink-custom';
        customPctInput.placeholder = s.customPct;
        customPctInput.min = '0.1';
        customPctInput.max = '96';
        customPctInput.step = '0.1';
        customPctInput.style.display = 'none';

        typeSelect.addEventListener('change', function () {
            var isCustom = s.drinkTypes[parseInt(typeSelect.value)].custom;
            customMlInput.style.display  = isCustom ? '' : 'none';
            customPctInput.style.display = isCustom ? '' : 'none';
        });

        var removeBtn = document.createElement('button');
        removeBtn.className = 'alcohol-remove-btn';
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.title = s.removeBtn;
        removeBtn.addEventListener('click', function () {
            drinksList.removeChild(drinkRow);
        });

        drinkRow.appendChild(typeSelect);
        drinkRow.appendChild(customMlInput);
        drinkRow.appendChild(customPctInput);
        drinkRow.appendChild(removeBtn);
        drinksList.appendChild(drinkRow);
    }

    addDrinkBtn.addEventListener('click', addDrinkRow);
    addDrinkRow(); // start with one row

    card.appendChild(drinksSection);

    // ─── Time elapsed ─────────────────────────────────────────────
    var timeSection = document.createElement('div');
    timeSection.className = 'alcohol-section';

    var timeRow = document.createElement('div');
    timeRow.className = 'alcohol-row';

    var timeLabelEl = document.createElement('label');
    timeLabelEl.className = 'alcohol-label';
    timeLabelEl.textContent = s.timeLabel;

    var timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.className = 'alcohol-input';
    timeInput.min = '0';
    timeInput.max = '24';
    timeInput.step = '0.5';
    timeInput.value = '0';

    timeRow.appendChild(timeLabelEl);
    timeRow.appendChild(timeInput);
    timeSection.appendChild(timeRow);
    card.appendChild(timeSection);

    // ─── Calculate button ─────────────────────────────────────────
    var calcBtn = document.createElement('button');
    calcBtn.className = 'alcohol-calc-btn';
    calcBtn.type = 'button';
    calcBtn.textContent = s.calcBtn;
    card.appendChild(calcBtn);

    // ─── Result area ──────────────────────────────────────────────
    var resultArea = document.createElement('div');
    resultArea.className = 'alcohol-result';
    resultArea.style.display = 'none';
    card.appendChild(resultArea);

    calcBtn.addEventListener('click', function () {
        var weight = parseFloat(weightInput.value);
        if (!weight || weight < 30 || weight > 200) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = '<p class="alcohol-error">' + s.noData + '</p>';
            return;
        }

        var drinkRows = drinksList.querySelectorAll('.alcohol-drink-row');
        if (drinkRows.length === 0) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = '<p class="alcohol-error">' + s.noDrinks + '</p>';
            return;
        }

        // Total pure alcohol in grams (density of ethanol ≈ 0.789 g/ml)
        var totalAlcohol = 0;
        drinkRows.forEach(function (row) {
            var sel = row.querySelector('select');
            var idx = parseInt(sel.value);
            var dt  = s.drinkTypes[idx];
            var ml, pct;
            if (dt.custom) {
                var inputs = row.querySelectorAll('.alcohol-drink-custom');
                ml  = parseFloat(inputs[0].value) || 0;
                pct = parseFloat(inputs[1].value) || 0;
            } else {
                ml  = dt.ml;
                pct = dt.pct;
            }
            totalAlcohol += ml * (pct / 100) * 0.789;
        });

        // Widmark formula: BAC (‰) = A / (r × W) − β × t
        var r    = selectedGender === 'male' ? 0.7 : 0.6;
        var beta = 0.15; // ‰ per hour
        var t    = Math.max(0, parseFloat(timeInput.value) || 0);
        var bac  = Math.max(0, (totalAlcohol / (r * weight)) - beta * t);

        // Intoxication level
        var level = s.levels[s.levels.length - 1];
        for (var i = 0; i < s.levels.length; i++) {
            if (bac < s.levels[i].max) { level = s.levels[i]; break; }
        }

        // Hours to sober
        var soberTime = bac > 0 ? (bac / beta).toFixed(1) : '0';

        resultArea.style.display = 'block';
        resultArea.innerHTML =
            '<h3 class="alcohol-result-title">' + s.resultTitle + '</h3>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.bacLabel + '</span>' +
                '<span class="alcohol-result-value">' + bac.toFixed(2) + ' ‰</span>' +
            '</div>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.levelLabel + '</span>' +
                '<span class="alcohol-result-level" style="background:' + level.color + '">' + level.text + '</span>' +
            '</div>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.soberLabel + '</span>' +
                '<span class="alcohol-result-value">' + soberTime + ' ' + s.soberHours + '</span>' +
            '</div>' +
            '<p class="alcohol-disclaimer">' + s.disclaimer + '</p>';
    });
}

// ===== SPIRAL / GOODNIGHT GAME =====

function renderSpiralGame() {
    // Cancel previous spiral if any
    if (_spiralToken) { _spiralToken.cancelled = true; _spiralToken = null; }
    contentArea.innerHTML = '';

    var uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';
    var labelsMap = {
        ru: { slower: 'Медленнее', faster: 'Быстрее',  hint: 'Смотри в центр · расслабься · דבש' },
        uk: { slower: 'Повільніше', faster: 'Швидше',   hint: 'Дивись у центр · розслабся · דבש'  },
        de: { slower: 'Langsamer',  faster: 'Schneller', hint: 'Schau in die Mitte · entspanne dich · דבש' },
        he: { slower: 'אטי יותר',   faster: 'מהיר יותר', hint: 'הסתכל למרכז · הירגע · דבש' }
    };
    var labels = labelsMap[uiLang];

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('spiral', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    // Dark canvas wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'spiral-wrapper';
    contentArea.appendChild(wrapper);

    // Hint label
    var hintLabel = document.createElement('div');
    hintLabel.className = 'spiral-label';
    hintLabel.textContent = labels.hint;
    wrapper.appendChild(hintLabel);

    // Canvas
    var canvas = document.createElement('canvas');
    canvas.className = 'spiral-canvas';
    wrapper.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    // Speed controls
    var ctrlDiv = document.createElement('div');
    ctrlDiv.className = 'spiral-controls';
    var slowerBtn = document.createElement('button');
    slowerBtn.className = 'spiral-btn';
    slowerBtn.textContent = labels.slower;
    var fasterBtn = document.createElement('button');
    fasterBtn.className = 'spiral-btn';
    fasterBtn.textContent = labels.faster;
    ctrlDiv.appendChild(slowerBtn);
    ctrlDiv.appendChild(fasterBtn);
    wrapper.appendChild(ctrlDiv);

    // --- Animation state ---
    var W, H;
    function resize() {
        W = canvas.width  = wrapper.clientWidth  || 600;
        H = canvas.height = wrapper.clientHeight || 400;
    }
    resize();

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    // 4 spiral arms
    var streams = [
        { text: 'ПРОКЛЯТ АМАН',         type: 'cursed'      },
        { text: 'БЛАГОСЛОВЕН МОРДЕХАЙ', type: 'blessed'     },
        { text: 'ברוך מרדכי',           type: 'heb_blessed' },
        { text: 'ארור המן',             type: 'heb_cursed'  }
    ];
    streams.forEach(function(s, i) {
        s.chars = i >= 2 ? s.text.split('').reverse() : s.text.split('');
    });

    var speed = 0.4;
    var t = 0;

    slowerBtn.addEventListener('click', function() { speed = Math.max(0.05, speed - 0.3); });
    fasterBtn.addEventListener('click', function() { speed = Math.min(3,    speed + 0.3); });

    function getColor(type, pulse, fade) {
        var a = fade * pulse;
        switch (type) {
            case 'cursed':      return 'rgba(' + ~~(200*pulse) + ',' + ~~(15*pulse) + ',20,' + a + ')';
            case 'blessed':     return 'rgba(255,' + ~~(200*pulse) + ',0,' + a + ')';
            case 'heb_blessed': return 'rgba(255,' + ~~(220*pulse) + ',' + ~~(60*pulse) + ',' + a + ')';
            case 'heb_cursed':  return 'rgba(' + ~~(220*pulse) + ',' + ~~(10*pulse) + ',' + ~~(50*pulse) + ',' + a + ')';
        }
    }

    var token = { cancelled: false };
    _spiralToken = token;

    // Initial dark fill
    ctx.fillStyle = '#0a0010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function draw() {
        if (token.cancelled) {
            resizeObserver.disconnect();
            return;
        }

        ctx.fillStyle = 'rgba(10,0,16,0.17)';
        ctx.fillRect(0, 0, W, H);

        var cx = W / 2;
        var cy = H / 2;
        var steps = 55;

        for (var arm = 0; arm < 4; arm++) {
            var armOffset = (arm / 4) * Math.PI * 2;
            var stream    = streams[arm];
            var isHebrew  = arm >= 2;

            for (var i = 0; i < steps; i++) {
                var ch    = stream.chars[(i + ~~(t * 2)) % stream.chars.length];
                var r     = i * 9 + 12;
                var angle = i * 0.28 + t + armOffset;
                var x     = cx + r * Math.cos(angle);
                var y     = cy + r * Math.sin(angle);

                var fade     = Math.min(1, (i / steps) * 2.2);
                var pulse    = 0.65 + 0.35 * Math.sin(t * 1.8 + i * 0.35);
                var fontSize = Math.max(9, 22 - i * 0.18);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2 + (isHebrew ? Math.PI : 0));
                ctx.font = fontSize + 'px serif';
                ctx.fillStyle = getColor(stream.type, pulse, fade);
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(ch, 0, 0);
                ctx.restore();
            }
        }

        // Pulsing centre glow
        var gp  = 0.5 + 0.5 * Math.sin(t * 0.5);
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
        grd.addColorStop(0, 'rgba(' + ~~(255*gp) + ',' + ~~(160*gp) + ',' + ~~(20*(1-gp)) + ',0.15)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fill();

        t += speed * 0.012;
        requestAnimationFrame(draw);
    }

    draw();
}

// ===== MUSIC PLAYER =====

var mpTracks = [];
var mpIndex = 0;
var mpAudio = new Audio();
var mpPlaying = false;

function updateProgressBar() { /* replaced by music player */ }

function initMusicPlayer() {
    fetch('tracks.json')
        .then(function (r) { return r.json(); })
        .then(function (tracks) {
            mpTracks = tracks;
            if (!mpTracks.length) return;
            mpLoad(0);
            bindMpEvents();
        })
        .catch(function () { /* tracks.json not available yet */ });
}

function mpLoad(index) {
    mpIndex = index;
    var track = mpTracks[mpIndex];
    mpAudio.src = track.url;
    document.getElementById('mp-title').textContent = '\u266a ' + track.title;
    document.getElementById('mp-bar-fill').style.width = '0%';
    if (mpPlaying) { mpAudio.play(); }
}

function bindMpEvents() {
    var btnPlay = document.getElementById('mp-play');
    var btnPrev = document.getElementById('mp-prev');
    var btnNext = document.getElementById('mp-next');
    var bar     = document.getElementById('mp-bar');

    btnPlay.addEventListener('click', function () {
        if (mpPlaying) {
            mpAudio.pause();
            mpPlaying = false;
            btnPlay.textContent = '\u25b6';
        } else {
            mpAudio.play();
            mpPlaying = true;
            btnPlay.textContent = '\u23f8';
        }
    });

    btnPrev.addEventListener('click', function () {
        mpLoad((mpIndex - 1 + mpTracks.length) % mpTracks.length);
    });

    btnNext.addEventListener('click', function () {
        mpLoad((mpIndex + 1) % mpTracks.length);
    });

    mpAudio.addEventListener('timeupdate', function () {
        if (mpAudio.duration) {
            var pct = (mpAudio.currentTime / mpAudio.duration) * 100;
            document.getElementById('mp-bar-fill').style.width = pct + '%';
        }
    });

    mpAudio.addEventListener('ended', function () {
        mpPlaying = true;
        mpLoad((mpIndex + 1) % mpTracks.length);
        mpAudio.play();
    });

    bar.addEventListener('click', function (e) {
        if (!mpAudio.duration) return;
        var rect = bar.getBoundingClientRect();
        mpAudio.currentTime = ((e.clientX - rect.left) / rect.width) * mpAudio.duration;
    });
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

// ── VISITOR COUNTER ──────────────────────────────────────
(function trackVisitor() {
    var el = document.getElementById('visitor-count');
    if (!el) return;
    fetch('https://api.counterapi.dev/v1/purim-jewishinsights/visits/up')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data && typeof data.count === 'number') {
                el.textContent = data.count.toLocaleString();
            }
        })
        .catch(function () { /* silently ignore errors */ });
})();

// ── PRELOADER ────────────────────────────────────────────
(function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    const hide = () => preloader.classList.add('hidden');
    if (document.readyState === 'complete') {
        // small delay so user sees the clown at least briefly
        setTimeout(hide, 600);
    } else {
        window.addEventListener('load', () => setTimeout(hide, 600));
    }
})();
