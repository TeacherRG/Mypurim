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
