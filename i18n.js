// ===== I18N MODULE =====
// Internationalization module for UI labels.
// Content translations are handled via JSON files in /translations/.
// This module handles static interface labels only.

const I18N = (function () {

    const TRANSLATIONS = {

        ru: {
            pageTitle:        'Праздник Пурим — праздник Божественного провидения',
            headerTitle:      'Пурим — праздник еврейского народа, семьи и детей',
            progressLabel:    'завершено',
            dedication:       'Посвящается юбилею семьи Гринберг и её детям — Йосеф Ицхаку, Шейне, Аарону и Рахель   7 адара 5786 года',
            sidebarTitle:     'Меню',
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
            estherDesc:       'Выберите язык в верхнем меню, чтобы открыть Свиток на нужном языке. Вы можете читать текст прямо на странице или скачать файл.',
            estherOpen:          'Открыть в новой вкладке',
            estherDownload:      'Скачать PDF',
            estherPart1:         'Часть 1',
            estherPart2:         'Часть 2',
            estherMobileNotice:  'На мобильных устройствах просмотр PDF внутри страницы недоступен. Используйте кнопки выше, чтобы открыть или скачать файл.',
            shareCopied:         'Ссылка скопирована',
            visitorLabel:        'Посетителей:',
            sections: {
                intro:         'О проекте',
                dvar_malchut:  'Двар Малхут',
                section_a:     'Раздел 1',
                section_b:     'Раздел 2',
                section_c:     'Раздел 3',
                halacha:       'Алаха',
                esther_scroll: 'Чтение Свитка Эстер',
                tzedaka:       'Дать Цдаку',
                dreidel:       'Игра в дрейдл 🎡'
            }
        },

        uk: {
            pageTitle:        'Свято Пурим',
            headerTitle:      'Пурим — свято єврейського народу, родини та дітей',
            progressLabel:    'завершено',
            dedication:       'Присвячується ювілею родини Грінберг та її дітям — Йосеф Іцхаку, Шейне, Аарону та Рахель   7 адара 5786 года',
            sidebarTitle:     'Меню',
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
            estherDesc:       'Оберіть мову у верхньому меню, щоб відкрити Сувій потрібною мовою. Ви можете читати текст на сторінці або завантажити файл.',
            estherOpen:          'Відкрити у новій вкладці',
            estherDownload:      'Завантажити PDF',
            estherPart1:         'Частина 1',
            estherPart2:         'Частина 2',
            estherMobileNotice:  'На мобільних пристроях перегляд PDF на сторінці недоступний. Використовуйте кнопки вище, щоб відкрити або завантажити файл.',
            shareCopied:         'Посилання скопійовано',
            visitorLabel:        'Відвідувачів:',
            sections: {
                intro:         'Про проєкт',
                dvar_malchut:  'Двар Малхут',
                section_a:     'Розділ 1',
                section_b:     'Розділ 2',
                section_c:     'Розділ 3',
                halacha:       'Алаха',
                esther_scroll: 'Читання Сувою Естер',
                tzedaka:       'Дати Цдаку',
                dreidel:       'Гра в дрейдл 🎡'
            }
        },

        de: {
            pageTitle:        'Purim-Fest',
            headerTitle:      'Purim — Fest des jüdischen Volkes, der Familie und der Kinder',
            progressLabel:    'abgeschlossen',
            dedication:       'Gewidmet dem Jubiläum der Familie Grinberg und ihren Kindern — Yosef Yitzchak, Sheina, Aharon und Rachel  7 Adar 5786',
            sidebarTitle:     'Menu',
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
            estherDesc:       'Wählen Sie oben die Sprache aus, um die Megillat Esther in der gewünschten Sprache zu öffnen. Sie können den Text direkt auf der Seite lesen oder die Datei herunterladen.',
            estherOpen:          'In neuem Tab öffnen',
            estherDownload:      'PDF herunterladen',
            estherPart1:         'Teil 1',
            estherPart2:         'Teil 2',
            estherMobileNotice:  'Auf mobilen Geräten ist die PDF-Anzeige auf der Seite nicht verfügbar. Verwenden Sie die Schaltflächen oben, um die Datei zu öffnen oder herunterzuladen.',
            shareCopied:         'Link kopiert',
            visitorLabel:        'Besucher:',
            sections: {
                intro:         'Über das Projekt',
                dvar_malchut:  'Dvar Malchut',
                section_a:     'Abschnitt 1',
                section_b:     'Abschnitt 2',
                section_c:     'Abschnitt 3',
                halacha:       'Halacha',
                esther_scroll: 'Lesen der Megillat Esther',
                tzedaka:       'Zedaka geben',
                dreidel:       'Dreidel-Spiel 🎡'
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
