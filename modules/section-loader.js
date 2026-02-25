// ===== LOAD SECTION =====

async function loadSection(id) {
    // Notify previous section to clean up its listeners (e.g. maharash keydown/fullscreenchange)
    contentArea.dispatchEvent(new CustomEvent('maharash-cleanup'));
    // Cancel any running spiral animation
    if (_spiralToken) { _spiralToken.cancelled = true; _spiralToken = null; }
    currentId = id;
    closeNavPopup();

    // PDF and donate sections have special rendering
    const sectionCfg = SECTIONS.find(function (s) { return s.id === id; });
    if (sectionCfg && sectionCfg.type === 'home') {
        renderHome();
        renderSidebar();
        updateProgressBar();
        return;
    }
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
    if (sectionCfg && sectionCfg.type === 'shum') {
        renderShumGame();
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
    if (sectionCfg && sectionCfg.type === 'megilla_shop') {
        renderMegillaShop();
        renderSidebar();
        updateProgressBar();
        return;
    }
    if (sectionCfg && sectionCfg.type === 'megilla_listen') {
        renderMegillaListen();
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
    let baseData;
    try {
        baseData = await fetch('sections/' + id + '.json').then(function (r) {
            if (!r.ok) throw new Error('not found');
            return r.json();
        });
    } catch (e) {
        AppLogger.error('section-loader: section "' + id + '" not found', e);
        contentArea.innerHTML = '';
        const errMsg = document.createElement('p');
        errMsg.style.cssText = 'color:red;padding:2rem';
        errMsg.textContent = 'Раздел не найден: ' + id;
        contentArea.appendChild(errMsg);
        renderSidebar();
        return;
    }

    // Try to load translation if needed
    let transData = null;
    if (transFolder) {
        try {
            transData = await fetch('translations/' + transFolder + '/' + id + '.json')
                .then(function (r) { return r.json(); });
        } catch (e) {
            AppLogger.info('section-loader: translation "' + transFolder + '/' + id + '" not available, using base', e);
            transData = null;
        }
    }

    renderSection(baseData, transData);
    renderSidebar();
    updateProgressBar();
}

function updateProgressBar() { /* replaced by music player */ }
