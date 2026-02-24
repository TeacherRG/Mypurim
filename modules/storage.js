// ===== STORAGE =====

function loadProgress() {
    const saved = localStorage.getItem('lessonProgress');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            AppLogger.error('storage: corrupted lessonProgress — resetting', e);
            localStorage.removeItem('lessonProgress');
        }
    }
}

function saveProgress() {
    localStorage.setItem('lessonProgress', JSON.stringify(state));
}
