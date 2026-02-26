// ===== HANGMAN SECTION =====

function renderHangmanSection() {
    contentArea.innerHTML = '';

    const titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('hangman', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    const gameEl = document.createElement('div');
    gameEl.id = 'hangman-game-root';
    contentArea.appendChild(gameEl);

    HangmanGame.render(gameEl, langMode);
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', function () {
    loadProgress();
    langSelect.value = langMode;
    I18N.applyTranslations(langMode);
    renderSidebar();
    var initialHash = window.location.hash.slice(1);
    var validInitial = SECTIONS.find(function (s) { return s.id === initialHash; });
    loadSection(validInitial ? initialHash : 'home');
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

    document.getElementById('nav-privacy-btn').addEventListener('click', function () {
        closeNavPopup();
        renderInfoPage('privacyTitle', 'privacyContent');
    });

    document.getElementById('nav-help-btn').addEventListener('click', function () {
        closeNavPopup();
        renderInfoPage('helpTitle', 'helpContent');
    });

    // Close popup on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNavPopup();
    });
});

// ===== VISITOR COUNTER =====

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
        .catch(function (e) { AppLogger.warn('visitor-counter: fetch failed', e); });
})();

// ===== PRELOADER =====

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
