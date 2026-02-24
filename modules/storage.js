// ===== STORAGE =====

function loadProgress() {
    const saved = localStorage.getItem('lessonProgress');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            localStorage.removeItem('lessonProgress');
        }
    }
}

function saveProgress() {
    localStorage.setItem('lessonProgress', JSON.stringify(state));
}
