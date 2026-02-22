// =============================
// GLOBAL STATE
// =============================

let lessonData = null;
let currentSectionIndex = 0;

let state = {
    completedSections: []
};

// =============================
// DOM ELEMENTS
// =============================

const contentContainer = document.getElementById("content");
const sidebarMenu = document.getElementById("sidebar-menu");
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");

// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded", init);

async function init() {
    loadProgress();
    await loadLesson();
    updateProgressBar();
}

// =============================
// LOAD JSON
// =============================

async function loadLesson() {
    try {
        const response = await fetch("lessonData.json");

        if (!response.ok) {
            throw new Error("Ошибка загрузки JSON");
        }

        lessonData = await response.json();

        renderSidebar();
        renderSection(0);

    } catch (error) {
        console.error("Ошибка:", error);
        contentContainer.innerHTML = "<p>Ошибка загрузки данных урока.</p>";
    }
}

// =============================
// SIDEBAR
// =============================

function renderSidebar() {
    sidebarMenu.innerHTML = "";

    lessonData.sections.forEach((section, index) => {

        const li = document.createElement("li");
        li.textContent = section.title;

        // Блокировка
        if (index > 0 && !state.completedSections.includes(lessonData.sections[index - 1].id)) {
            li.classList.add("locked");
        }

        // Завершён
        if (state.completedSections.includes(section.id)) {
            li.classList.add("completed");
        }

        // Активный
        if (index === currentSectionIndex) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => {
            if (!li.classList.contains("locked")) {
                currentSectionIndex = index;
                renderSidebar();
                renderSection(index);
            }
        });

        sidebarMenu.appendChild(li);
    });
}

// =============================
// RENDER SECTION
// =============================

function renderSection(index) {

    const section = lessonData.sections[index];
    contentContainer.innerHTML = "";

    const card = document.createElement("section");
    card.classList.add("lesson-card");

    const title = document.createElement("h2");
    title.textContent = section.title;
    card.appendChild(title);

    // Контент
    section.content.forEach(block => {

        if (block.type === "paragraph") {
            const p = document.createElement("p");
            p.textContent = block.text;
            card.appendChild(p);
        }

        if (block.type === "quote") {
            const quote = document.createElement("blockquote");
            quote.textContent = block.text;
            card.appendChild(quote);
        }

    });

    // Источники
    if (section.sources) {

        section.sources.forEach(source => {

            const sourceBlock = document.createElement("div");
            sourceBlock.classList.add("source-block");

            const header = document.createElement("div");
            header.classList.add("source-header");
            header.textContent = source.title;

            const body = document.createElement("div");
            body.classList.add("source-body");
            body.textContent = source.text;

            header.addEventListener("click", () => {
                body.classList.toggle("open");
            });

            sourceBlock.appendChild(header);
            sourceBlock.appendChild(body);

            card.appendChild(sourceBlock);
        });
    }

    contentContainer.appendChild(card);

    // Квиз
    if (section.quiz && !state.completedSections.includes(section.id)) {
        renderQuiz(section);
    }
}

// =============================
// RENDER QUIZ
// =============================
function renderQuiz(section) {

    const quizCard = document.createElement("section");
    quizCard.classList.add("quiz-card");

    const header = document.createElement("div");
    header.classList.add("quiz-header");
    header.textContent = "Проверь понимание";

    const body = document.createElement("div");
    body.classList.add("quiz-body");

    header.addEventListener("click", () => {
        body.classList.toggle("open");
    });

    quizCard.appendChild(header);
    quizCard.appendChild(body);

    section.quiz.questions.forEach((q, qIndex) => {

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");

        const questionText = document.createElement("p");
        questionText.textContent = q.question;
        questionDiv.appendChild(questionText);

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

    const resultMessage = document.createElement("div");
    resultMessage.classList.add("quiz-result");
    body.appendChild(resultMessage);

    const button = document.createElement("button");
    button.classList.add("quiz-button");
    button.textContent = "Ответить";

    button.addEventListener("click", () => checkQuiz(section.id, quizCard));

    body.appendChild(button);

    contentContainer.appendChild(quizCard);
}

// =============================
// CHECK QUIZ
// =============================
function checkQuiz(sectionId, quizCard) {

    const selected = quizCard.querySelectorAll("input[type='radio']:checked");
    const allQuestions = quizCard.querySelectorAll(".question");
    const resultMessage = quizCard.querySelector(".quiz-result");

    if (selected.length === 0) {
        resultMessage.textContent = "Выберите ответы перед проверкой.";
        resultMessage.style.color = "red";
        return;
    }

    let correctCount = 0;

    allQuestions.forEach(question => {

        const inputs = question.querySelectorAll("input");

        inputs.forEach(input => {
            const label = input.parentElement;
            label.style.color = "";
        });

        const checked = question.querySelector("input:checked");

        if (checked) {
            if (checked.dataset.correct === "true") {
                correctCount++;
                checked.parentElement.style.color = "green";
            } else {
                checked.parentElement.style.color = "red";

                // подсветить правильный
                inputs.forEach(input => {
                    if (input.dataset.correct === "true") {
                        input.parentElement.style.color = "green";
                    }
                });
            }
        }
    });

    if (correctCount === allQuestions.length) {

        resultMessage.textContent = "Все ответы верны. Раздел завершён.";
        resultMessage.style.color = "green";

        if (!state.completedSections.includes(sectionId)) {
            state.completedSections.push(sectionId);
            saveProgress();
        }

        updateProgressBar();
        renderSidebar();

        // свернуть квиз
        const body = quizCard.querySelector(".quiz-body");
        body.classList.remove("open");

    } else {
        resultMessage.textContent = "Есть ошибки. Попробуйте снова.";
        resultMessage.style.color = "red";
    }
}

// =============================
// PROGRESS
// =============================

function updateProgressBar() {

    const total = lessonData.sections.filter(s => s.quiz).length;
    const completed = state.completedSections.length;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

// =============================
// LOCAL STORAGE
// =============================

function loadProgress() {
    const saved = localStorage.getItem("purimLessonProgress");
    if (saved) {
        state = JSON.parse(saved);
    }
}

function saveProgress() {
    localStorage.setItem("purimLessonProgress", JSON.stringify(state));
              }
