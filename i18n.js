// ===== I18N MODULE =====
// Internationalization module for UI labels.
// Content translations are handled via JSON files in /translations/.
// This module handles static interface labels only.

const I18N = (function () {

    const TRANSLATIONS = {

        ru: {
            pageTitle:        'Праздник Пурим — Интерактивный урок',
            headerTitle:      'Пурим — праздник еврейского народа, семьи и детей',
            progressLabel:    'завершено',
            dedication:       'Посвящается юбилею семьи Гринберг и её детям — Йосеф Ицхаку, Шейне, Аарону и Рахель   7 адара 5786 года',
            sidebarTitle:     'Структура урока',
            quizHeader:       'Проверь понимание',
            quizSubmit:       'Ответить',
            quizAllCorrect:   'Все ответы верны. Раздел завершён.',
            quizHasErrors:    'Есть ошибки. Попробуйте снова.',
            quizAlreadyDone:  'Раздел уже завершён.',
            footerTranslation:'Перевод и адаптация на русском языке:',
            footerAI:         'При участии искусственного интеллекта ChatGPT (OpenAI)',
            footerCopyright:  '© 2026 Shluchim Office International. Все права защищены.',
            footerContact:    'По дополнительным вопросам:',
            footerMaterials:  'Для загрузки дополнительных учебных материалов посетите сайт:',
            sections: {
                intro:     'Введение',
                section_a: 'Раздел 1',
                section_b: 'Раздел 2',
                section_c: 'Раздел 3'
            }
        },

        uk: {
            pageTitle:        'Свято Пурим — Інтерактивний урок',
            headerTitle:      'Пурим — свято єврейського народу, родини та дітей',
            progressLabel:    'завершено',
            dedication:       'Присвячується ювілею родини Грінберг та її дітям — Йосеф Іцхаку, Шейне, Аарону та Рахель   7 адара 5786 года',
            sidebarTitle:     'Структура уроку',
            quizHeader:       'Перевір розуміння',
            quizSubmit:       'Відповісти',
            quizAllCorrect:   'Усі відповіді правильні. Розділ завершено.',
            quizHasErrors:    'Є помилки. Спробуйте ще раз.',
            quizAlreadyDone:  'Розділ вже завершено.',
            footerTranslation:'Переклад та адаптація українською мовою:',
            footerAI:         'За участі штучного інтелекту ChatGPT (OpenAI)',
            footerCopyright:  '© 2026 Shluchim Office International. Усі права захищені.',
            footerContact:    'З додаткових питань:',
            footerMaterials:  'Для завантаження додаткових навчальних матеріалів відвідайте сайт:',
            sections: {
                intro:     'Вступ',
                section_a: 'Розділ 1',
                section_b: 'Розділ 2',
                section_c: 'Розділ 3'
            }
        },

        de: {
            pageTitle:        'Purim-Fest — Interaktive Lektion',
            headerTitle:      'Purim — Fest des jüdischen Volkes, der Familie und der Kinder',
            progressLabel:    'abgeschlossen',
            dedication:       'Gewidmet dem Jubiläum der Familie Grinberg und ihren Kindern — Yosef Yitzchak, Sheina, Aharon und Rachel  7 Adar 5786',
            sidebarTitle:     'Unterrichtsstruktur',
            quizHeader:       'Verständnis prüfen',
            quizSubmit:       'Antworten',
            quizAllCorrect:   'Alle Antworten richtig. Abschnitt abgeschlossen.',
            quizHasErrors:    'Es gibt Fehler. Bitte versuchen Sie es erneut.',
            quizAlreadyDone:  'Abschnitt bereits abgeschlossen.',
            footerTranslation:'Übersetzung und Bearbeitung auf Russisch:',
            footerAI:         'Mit Beteiligung der künstlichen Intelligenz ChatGPT (OpenAI)',
            footerCopyright:  '© 2026 Shluchim Office International. Alle Rechte vorbehalten.',
            footerContact:    'Für weitere Fragen:',
            footerMaterials:  'Um zusätzliche Lernmaterialien herunterzuladen, besuchen Sie die Website:',
            sections: {
                intro:     'Einführung',
                section_a: 'Abschnitt 1',
                section_b: 'Abschnitt 2',
                section_c: 'Abschnitt 3'
            }
        }

    };

    // Dual modes (ru-uk, ru-de) keep Russian UI
    function getUILang(langMode) {
        if (langMode === 'uk') return 'uk';
        if (langMode === 'de') return 'de';
        return 'ru';
    }

    // Get a translated string by key
    function t(key, langMode) {
        const lang = getUILang(langMode);
        const trans = TRANSLATIONS[lang] || TRANSLATIONS.ru;
        return trans[key] !== undefined ? trans[key] : (TRANSLATIONS.ru[key] || key);
    }

    // Get translated section title by section id
    function sectionTitle(sectionId, langMode) {
        const lang = getUILang(langMode);
        const trans = TRANSLATIONS[lang] || TRANSLATIONS.ru;
        return (trans.sections && trans.sections[sectionId])
            || (TRANSLATIONS.ru.sections && TRANSLATIONS.ru.sections[sectionId])
            || sectionId;
    }

    // Apply translations to all [data-i18n] elements and update page/html metadata
    function applyTranslations(langMode) {
        const lang = getUILang(langMode);
        const trans = TRANSLATIONS[lang] || TRANSLATIONS.ru;

        // Page title
        document.title = trans.pageTitle || TRANSLATIONS.ru.pageTitle;

        // HTML lang attribute for accessibility
        document.documentElement.lang = lang;

        // All elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.getAttribute('data-i18n');
            if (trans[key] !== undefined) {
                el.textContent = trans[key];
            }
        });
    }

    return {
        t:                  t,
        sectionTitle:       sectionTitle,
        applyTranslations:  applyTranslations
    };

})();
