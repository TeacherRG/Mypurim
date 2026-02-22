// =============================
// CONFIG
// =============================

const sectionsList = [
    { id: "intro", title: "Введение" },
    { id: "section_a", title: "Раздел 1" },
    { id: "section_b", title: "Раздел 2" },
    { id: "section_c", title: "Раздел 3" }
];

let langMode = localStorage.getItem("langMode") || "ru";
const langSelect = document.getElementById("langMode");
const container = document.getElementById("lesson-container");

langSelect.addEventListener("change", function () {
    langMode = this.value;
    localStorage.setItem("langMode", langMode);
    if (currentSectionId) {
        loadSection(currentSectionId);
    }
});


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

const contentContainer = container;
const sidebarMenu = document.getElementById("sidebar-menu");
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");

// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded", init);

function init() {
    langSelect.value = langMode;
    loadProgress();
    renderSidebar();
    loadSection("intro");
    updateProgressBar();
}

// =============================
// SIDEBAR
// =============================

function renderSidebar() {

    sidebarMenu.innerHTML = "";

    sectionsList.forEach((section, index) => {

        const li = document.createElement("li");
        li.textContent = section.title;

        // ===== ЗАВЕРШЁН =====

        if (state.completedSections.includes(section.id)) {
            li.classList.add("completed");
        }

        // ===== АКТИВНЫЙ =====

        if (section.id === currentSectionId) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => {
            loadSection(section.id);
        });

        sidebarMenu.appendChild(li);
    });
}

// =============================
// LOAD SECTION
// =============================

async function loadSection(id) {

  currentSectionId = id;

  let basePath = "sections/";
  let translationPath = "";

  if (langMode === "uk" || langMode === "ru-uk") {
    translationPath = "translations/uk/";
  }

  if (langMode === "de" || langMode === "ru-de") {
    translationPath = "translations/de/";
  }

  const baseData = await fetch(`${basePath}${id}.json`).then(res => res.json());

  let translatedData = null;

  if (translationPath) {
    try {
      translatedData = await fetch(`${translationPath}${id}.json`).then(res => res.json());
    } catch {
      translatedData = null;
    }
  }

  renderSection(baseData, translatedData);
}

// =============================
// RENDER SECTION
// =============================
function renderSection(baseData, translatedData) {

  container.innerHTML = "";

  const isDual = langMode.includes("-");
  container.className = "lesson-container " + (isDual ? "double" : "single");

  const primaryData = (langMode === "uk" || langMode === "de")
    ? (translatedData || baseData)
    : baseData;

  const primaryCol = document.createElement("div");
  primaryCol.classList.add("lesson-column", "active");
  renderContentBlocks(primaryCol, primaryData);
  container.appendChild(primaryCol);

  if (isDual && translatedData) {
    const secondaryCol = document.createElement("div");
    secondaryCol.classList.add("lesson-column", "active");
    renderContentBlocks(secondaryCol, translatedData);
    container.appendChild(secondaryCol);
  }

  if (baseData.sources) {
    renderSources(baseData.sources);
  }

  if (baseData.quiz) {
    renderQuiz(baseData);
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

    // Считаем только разделы, где есть квиз
    const quizSections = sectionsList.filter(section => section.id !== "intro");

    const total = quizSections.length;
    const completed = state.completedSections.length;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

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
function renderContentBlocks(container, data) {

  data.content.forEach(block => {

    if (block.type === "paragraph") {
      const p = document.createElement("p");
      p.textContent = block.text;
      container.appendChild(p);
    }

    if (block.type === "quote") {
      const q = document.createElement("blockquote");
      q.textContent = block.text;
      container.appendChild(q);
    }

  });

}
