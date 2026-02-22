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
    initChat();
}

// =============================
// SIDEBAR
// =============================

function renderSidebar() {

    sidebarMenu.innerHTML = "";

    sectionsList.forEach((section, index) => {

        const li = document.createElement("li");
        li.textContent = section.title;

        // ===== ЛОГИКА БЛОКИРОВКИ =====

        if (section.id !== "intro" && section.id !== "section_a") {

            const prevSection = sectionsList[index - 1];

            if (!state.completedSections.includes(prevSection.id)) {
                li.classList.add("locked");
            }
        }

        // ===== ЗАВЕРШЁН =====

        if (state.completedSections.includes(section.id)) {
            li.classList.add("completed");
        }

        // ===== АКТИВНЫЙ =====

        if (section.id === currentSectionId) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => {
            if (!li.classList.contains("locked")) {
                loadSection(section.id);
            }
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

  const wrapper = document.createElement("div");
  wrapper.classList.add("multilang-container");

  if (langMode.includes("-")) {
    wrapper.classList.add("two-cols");
  }

  const primaryCol = document.createElement("div");
  primaryCol.classList.add("lang-column");

  renderContentBlocks(primaryCol, baseData);

  wrapper.appendChild(primaryCol);

  if (langMode !== "ru" && translatedData) {

    const secondaryCol = document.createElement("div");
    secondaryCol.classList.add("lang-column", "secondary");

    renderContentBlocks(secondaryCol, translatedData);

    wrapper.appendChild(secondaryCol);
  }

  container.appendChild(wrapper);

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
// =============================
// CHAT
// =============================

const CHAT_QA = [
    {
        keywords: ["пурим", "праздник", "purim"],
        answer: "Пурим — еврейский праздник, отмечаемый в память о спасении евреев в Персии в эпоху царя Ахашвероша. Основные заповеди: чтение Мегилат Эстер, трапеза, подарки бедным и подарки друзьям."
    },
    {
        keywords: ["эстер", "эсфирь"],
        answer: "Эстер (Эсфирь) — еврейская девушка, ставшая царицей Персии и спасшая свой народ от злодея Амана. Её история описана в Свитке Эстер (Мегилат Эстер)."
    },
    {
        keywords: ["аман"],
        answer: "Аман — главный злодей истории Пурима. Он был министром при дворе царя Ахашвероша и задумал уничтожить всех евреев Персии. Его злой умысел был раскрыт благодаря Эстер и Мордехаю."
    },
    {
        keywords: ["мордехай", "мордехей"],
        answer: "Мордехай — двоюродный брат и воспитатель Эстер. Он отказался кланяться Аману, что послужило поводом для ненависти Амана к евреям. Именно Мордехай убедил Эстер обратиться к царю."
    },
    {
        keywords: ["мегила", "свиток"],
        answer: "Мегилат Эстер (Свиток Эстер) — книга ТаНаХа, рассказывающая историю Пурима. Её читают вслух в ночь Пурима и утром. При упоминании имени Амана принято создавать шум."
    },
    {
        keywords: ["квиз", "вопрос", "тест", "задание"],
        answer: "Чтобы перейти к следующему разделу, нужно правильно ответить на вопросы теста в конце каждого раздела. Выбери правильный ответ и нажми 'Ответить'."
    },
    {
        keywords: ["раздел", "урок", "тема"],
        answer: "Урок состоит из 4 разделов: Введение, Раздел 1, Раздел 2 и Раздел 3. Разделы открываются последовательно по мере прохождения тестов."
    },
    {
        keywords: ["язык", "перевод", "украинский", "немецкий"],
        answer: "Урок доступен на русском, украинском и немецком языках. Выбери нужный язык в выпадающем меню вверху страницы. Также можно включить двухколоночный режим для сравнения двух языков."
    }
];

function getChatAnswer(userText) {
    const text = userText.toLowerCase();
    for (const item of CHAT_QA) {
        if (item.keywords.some(kw => text.includes(kw))) {
            return item.answer;
        }
    }
    return "Это интересный вопрос! К сожалению, я пока не знаю точного ответа. Попробуй внимательно перечитать соответствующий раздел урока или задай вопрос своему учителю.";
}

function appendChatMessage(text, role) {
    const messages = document.getElementById("chat-messages");
    const msg = document.createElement("div");
    msg.classList.add("chat-message", role);
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");
    bubble.textContent = text;
    msg.appendChild(bubble);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    appendChatMessage(text, "user");
    input.value = "";

    // Typing indicator
    const messages = document.getElementById("chat-messages");
    const typing = document.createElement("div");
    typing.classList.add("chat-message", "bot", "chat-typing");
    typing.innerHTML = '<div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        typing.remove();
        appendChatMessage(getChatAnswer(text), "bot");
    }, 700);
}

function initChat() {
    const toggleBtn = document.getElementById("chat-toggle-btn");
    const closeBtn = document.getElementById("chat-close-btn");
    const panel = document.getElementById("chat-panel");
    const sendBtn = document.getElementById("chat-send-btn");
    const input = document.getElementById("chat-input");
    const iconOpen = document.getElementById("chat-icon-open");
    const iconClose = document.getElementById("chat-icon-close");

    function openChat() {
        panel.classList.add("open");
        iconOpen.style.display = "none";
        iconClose.style.display = "block";
        input.focus();
    }

    function closeChat() {
        panel.classList.remove("open");
        iconOpen.style.display = "block";
        iconClose.style.display = "none";
    }

    toggleBtn.addEventListener("click", () => {
        panel.classList.contains("open") ? closeChat() : openChat();
    });

    closeBtn.addEventListener("click", closeChat);

    sendBtn.addEventListener("click", sendChatMessage);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendChatMessage();
    });
}

// =============================
// RENDER CONTENT BLOCKS
// =============================

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
