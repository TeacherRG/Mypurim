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
