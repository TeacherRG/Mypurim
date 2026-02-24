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
