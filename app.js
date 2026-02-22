// =============================
// CONFIG
// =============================

const sectionsList = [
    { id: "intro", title: "Введение" },
    { id: "section_a", title: "Раздел А" },
    { id: "section_b", title: "Раздел Б" }
];

// =============================
// STATE
// =============================

let currentSectionId = null;

let state = {
    completedSections: []
};

// =============================
// DOM
// =============================

const contentContainer = document.getElementById("content");
const sidebarMenu = document.getElementById("sidebar-menu");
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");

// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded", init);

function init() {
    loadProgress();
    renderSidebar();
    loadSection("intro");
    updateProgressBar();
}

// =============================
// SIDEBAR
// =============================

function renderSidebar() {

    // Блокировка только начиная со второго учебного раздела
if (section.id !== "intro") {

    const prevIndex = sectionsList.findIndex(s => s.id === section.id) - 1;
    const prevSection = sectionsList[prevIndex];

    if (prevSection && prevSection.id !== "intro" && 
        !state.completedSections.includes(prevSection.id)) {
        li.classList.add("locked");
    }
}
}

// =============================
// LOAD SECTION
// =============================

async function loadSection(sectionId) {

    try {
        const response = await fetch(`sections/${sectionId}.json`);
        const section = await response.json();

        currentSectionId = sectionId;
        renderSidebar();
        renderSection(section);

    } catch (error) {
        contentContainer.innerHTML = "Ошибка загрузки раздела.";
        console.error(error);
    }
}

// =============================
// RENDER SECTION
// =============================

function renderSection(section) {

    contentContainer.innerHTML = "";

    const card = document.createElement("section");
    card.classList.add("lesson-card");

    const title = document.createElement("h2");
    title.textContent = section.title;
    card.appendChild(title);

    section.content.forEach(block => {

        if (block.type === "paragraph") {
            const p = document.createElement("p");
            p.textContent = block.text;
            card.appendChild(p);
        }

        if (block.type === "quote") {
            const q = document.createElement("blockquote");
            q.textContent = block.text;
            card.appendChild(q);
        }

    });

    contentContainer.appendChild(card);

    if (section.sources) {
        renderSources(section.sources);
    }

    if (section.quiz) {
        renderQuiz(section);
    }
}

// =============================
// SOURCES
// =============================

function renderSources(sources) {

    sources.forEach(source => {

        const block = document.createElement("div");
        block.classList.add("source-block");

        const header = document.createElement("div");
        header.classList.add("source-header");
        header.textContent = source.title;

        const body = document.createElement("div");
        body.classList.add("source-body");
        body.textContent = source.text;

        header.addEventListener("click", () => {
            body.classList.toggle("open");
        });

        block.appendChild(header);
        block.appendChild(body);

        contentContainer.appendChild(block);
    });
}

// =============================
// QUIZ
// =============================

function renderQuiz(section) {

    const quizCard = document.createElement("section");
    quizCard.classList.add("quiz-card");

    const header = document.createElement("div");
    header.classList.add("quiz-header");
    header.textContent = "Проверь понимание";

    const body = document.createElement("div");
    body.classList.add("quiz-body", "open");

    header.addEventListener("click", () => {
        body.classList.toggle("open");
    });

    quizCard.appendChild(header);
    quizCard.appendChild(body);

    section.quiz.questions.forEach((q, qIndex) => {

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");

        const p = document.createElement("p");
        p.textContent = q.question;
        questionDiv.appendChild(p);

        q.options.forEach(option => {

            const label = document.createElement("label");

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "question_" + qIndex;
            input.dataset.correct = option.correct;

            label.appendChild(input);
            label.appendChild(document.createTextNode(option.text));

            questionDiv.appendChild(label);
        });

        body.appendChild(questionDiv);
    });

    const result = document.createElement("div");
    result.classList.add("quiz-result");
    body.appendChild(result);

    const button = document.createElement("button");
    button.classList.add("quiz-button");
    button.textContent = "Ответить";

    button.addEventListener("click", () => checkQuiz(section.id, quizCard));

    body.appendChild(button);

    contentContainer.appendChild(quizCard);

    if (state.completedSections.includes(section.id)) {
        body.classList.remove("open");
        result.textContent = "Раздел уже завершён.";
        result.style.color = "green";
    }
}

// =============================
// CHECK QUIZ
// =============================

function checkQuiz(sectionId, quizCard) {

    const questions = quizCard.querySelectorAll(".question");
    const result = quizCard.querySelector(".quiz-result");

    let allCorrect = true;

    questions.forEach(question => {

        const inputs = question.querySelectorAll("input");

        inputs.forEach(input => {
            input.parentElement.style.color = "";
        });

        const checked = question.querySelector("input:checked");

        if (!checked || checked.dataset.correct !== "true") {
            allCorrect = false;
        }

        inputs.forEach(input => {
            if (input.dataset.correct === "true") {
                input.parentElement.style.color = "green";
            }
        });

        if (checked && checked.dataset.correct !== "true") {
            checked.parentElement.style.color = "red";
        }

    });

    if (allCorrect) {

        result.textContent = "Все ответы верны. Раздел завершён.";
        result.style.color = "green";

        if (!state.completedSections.includes(sectionId)) {
            state.completedSections.push(sectionId);
            saveProgress();
        }

        updateProgressBar();
        renderSidebar();

        const body = quizCard.querySelector(".quiz-body");
        body.classList.remove("open");

    } else {
        result.textContent = "Есть ошибки. Попробуйте снова.";
        result.style.color = "red";
    }
}

// =============================
// PROGRESS
// =============================

function updateProgressBar() {

    const total = sectionsList.length - 1;
    const completed = state.completedSections.length;

    const percent = Math.round((completed / total) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

// =============================
// STORAGE
// =============================

function loadProgress() {
    const saved = localStorage.getItem("lessonProgress");
    if (saved) {
        state = JSON.parse(saved);
    }
}

function saveProgress() {
    localStorage.setItem("lessonProgress", JSON.stringify(state));
                    }
