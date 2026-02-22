let lessonData = null;
let currentSectionIndex = 0;

const contentContainer = document.getElementById("content");
const sidebar = document.querySelector(".sidebar ul");
const progressFill = document.querySelector(".progress-fill");
const progressLabel = document.querySelector(".progress-label");

let state = {
  completedSections: []
};

// ===== ЗАГРУЗКА ПРОГРЕССА =====

function loadProgress() {
  const saved = localStorage.getItem("purimLessonProgress");
  if (saved) {
    state = JSON.parse(saved);
  }
}

// ===== СОХРАНЕНИЕ =====

function saveProgress() {
  localStorage.setItem("purimLessonProgress", JSON.stringify(state));
}

// ===== ОБНОВЛЕНИЕ ПРОГРЕСС-БАРА =====

function updateProgressBar() {
  const totalLessons = lessonData.sections.filter(s => s.quiz).length;
  const completed = state.completedSections.length;

  const percent = Math.round((completed / totalLessons) * 100);

  progressFill.style.width = percent + "%";
  progressLabel.textContent = "Прогресс: " + percent + "%";
}

// ===== ЗАГРУЗКА JSON =====

async function loadLesson() {
  const response = await fetch("lessonData.json");
  lessonData = await response.json();

  loadProgress();
  renderSidebar();
  renderSection(0);
  updateProgressBar();
}

// ===== SIDEBAR =====

function renderSidebar() {
  sidebar.innerHTML = "";

  lessonData.sections.forEach((section, index) => {

    const li = document.createElement("li");
    li.textContent = section.title;

    if (index !== 0 && !state.completedSections.includes(lessonData.sections[index - 1]?.id)) {
      li.classList.add("locked");
    }

    if (state.completedSections.includes(section.id)) {
      li.classList.add("completed");
    }

    li.addEventListener("click", () => {
      if (!li.classList.contains("locked")) {
        renderSection(index);
      }
    });

    sidebar.appendChild(li);
  });
}

// ===== РЕНДЕР РАЗДЕЛА =====

function renderSection(index) {

  currentSectionIndex = index;
  const section = lessonData.sections[index];

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

  if (section.quiz && !state.completedSections.includes(section.id)) {
    renderQuiz(section);
  }
}

// ===== РЕНДЕР КВИЗА =====

function renderQuiz(section) {

  const quizData = section.quiz;

  const quizCard = document.createElement("section");
  quizCard.classList.add("quiz-card");

  const title = document.createElement("h3");
  title.textContent = "Проверь понимание";
  quizCard.appendChild(title);

  quizData.questions.forEach((q, qIndex) => {

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

    quizCard.appendChild(questionDiv);
  });

  const button = document.createElement("button");
  button.classList.add("quiz-button");
  button.textContent = "Ответить";

  button.addEventListener("click", () => checkQuiz(section.id));

  quizCard.appendChild(button);
  contentContainer.appendChild(quizCard);
}

// ===== ПРОВЕРКА КВИЗА =====

function checkQuiz(sectionId) {

  const selected = document.querySelectorAll("input[type='radio']:checked");

  if (selected.length === 0) {
    alert("Выберите ответ");
    return;
  }

  let correctCount = 0;

  selected.forEach(input => {
    if (input.dataset.correct === "true") {
      correctCount++;
    }
  });

  if (correctCount >= 1) {

    state.completedSections.push(sectionId);
    saveProgress();

    renderSidebar();
    updateProgressBar();

    alert("Раздел завершён!");
    renderSection(currentSectionIndex);

  } else {
    alert("Попробуйте снова");
  }
}

loadLesson();
