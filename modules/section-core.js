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
        navigator.share({ url: url }).catch(function (e) {
            // AbortError = user dismissed — not a real error
            if (!e || e.name !== 'AbortError') {
                AppLogger.warn('share: navigator.share failed', e);
            }
        });
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
