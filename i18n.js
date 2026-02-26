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
            dedication:       'Посвящается поднятию души Ирины бат Сара',
            sidebarTitle:     'Меню',
            quizHeader:       'Проверь понимание',
            quizSubmit:       'Ответить',
            quizAllCorrect:   'Все ответы верны. Раздел завершён.',
            quizHasErrors:    'Есть ошибки. Попробуйте снова.',
            quizAlreadyDone:  'Раздел уже завершён.',
            footerDvarRights: 'Права на «Двар Малхут» © 2026 Shluchim Office International',
            footerAudioRights:'Права на аудио и русскую версию Мегилы ©',
            footerPhotoRights:'Права на фото Мегилы Ребе Магараша ©',
            footerContact:    'Отзывы и комментарии:',
            footerCredit:     'Сайт создан Рав Реувен Гринберг',
            footerCopyright:  '© Все права защищены 2026',
            estherDesc:       'Выберите язык в верхнем меню, чтобы открыть Свиток на нужном языке. Вы можете читать текст прямо на странице или скачать файл.',
            estherOpen:          'Открыть в новой вкладке',
            estherDownload:      'Скачать PDF',
            estherPart1:         'Часть 1',
            estherPart2:         'Часть 2',
            estherMobileNotice:  'На мобильных устройствах просмотр PDF внутри страницы недоступен. Используйте кнопки выше, чтобы открыть или скачать файл.',
            shareCopied:         'Ссылка скопирована',
            visitorLabel:        'Посетителей:',
            sections: {
                home:            '🏠 Главная',
                intro:           'О проекте',
                dvar_malchut:    'Двар Малхут',
                section_a:       'Раздел 1',
                section_b:       'Раздел 2',
                section_c:       'Раздел 3',
                halacha:         'Алаха',
                megilla_read:    'Читать Мегилу',
                esther_scroll:   'Читать текст Мегилы',
                maharash_scroll: 'Читать свиток Мегилы',
                tzedaka:         'Дать Цдаку',
                games:           'Игры',
                dreidel:         'Игра в дрейдл 🎡',
                hangman:         'Повесь Амана! 🪢',
                spiral:          'Спокойной ночи 🌀',
                alcohol:         'Алкогольный калькулятор 🍷',
                shum:            'Шуметь! 📣',
                megilla_listen:  '🎤 Слушать Мегилу',
                megilla_shop:    '📜 Приобрести Мегилат Эстер'
            },
            mlListen:        'Слушать',
            mlStop:          'Закончить слушать',
            mlListening:     '🎙 Слушаю...',
            mlNotSupported:  'Ваш браузер не поддерживает распознавание речи',
            mlMicDenied:     'Доступ к микрофону запрещён',
            mlError:         'Ошибка распознавания речи',
            mlChapter:       'Глава',
            mlDownload:      '⬇ Скачать модуль распознавания речи (ок.100Мб)',
            mlDownloading:   '⏳ Загрузка модуля...',
            mlDownloadReady: '✅ Модуль загружен и готов',
            mlDownloadError: '❌ Ошибка загрузки модуля',
            mlModuleNotReady:'⚠ Сначала скачайте модуль',
            mlDownloadConfirm:'Для загрузки модуля распознавания речи потребуется скачать около 100 МБ данных. Продолжить?',
            audioPlayerTitle: '🎧 Прослушать Мегилу',
            audioPlay:        '▶ Слушать',
            audioPause:       '⏸ Пауза',
            audioStop:        '⏹ Стоп',
            audioSpeed:       'Скорость:',
            zoomIn:           'Увеличить',
            zoomOut:          'Уменьшить'
        },

        uk: {
            pageTitle:        'Свято Пурим',
            headerTitle:      'Пурим — свято єврейського народу, родини та дітей',
            progressLabel:    'завершено',
            dedication:       'Присвячується піднесенню душі Іріни бат Сара',
            sidebarTitle:     'Меню',
            quizHeader:       'Перевір розуміння',
            quizSubmit:       'Відповісти',
            quizAllCorrect:   'Усі відповіді правильні. Розділ завершено.',
            quizHasErrors:    'Є помилки. Спробуйте ще раз.',
            quizAlreadyDone:  'Розділ вже завершено.',
            footerDvarRights: 'Права на «Двар Малхут» © 2026 Shluchim Office International',
            footerAudioRights:'Права на аудіо та українську версію Мегіли ©',
            footerPhotoRights:'Права на фото Мегіли Ребе Магараша ©',
            footerContact:    'Відгуки та коментарі:',
            footerCredit:     'Сайт створений Рав Реувен Гринберг',
            footerCopyright:  '© Всі права захищені 2026',
            estherDesc:       'Оберіть мову у верхньому меню, щоб відкрити Сувій потрібною мовою. Ви можете читати текст на сторінці або завантажити файл.',
            estherOpen:          'Відкрити у новій вкладці',
            estherDownload:      'Завантажити PDF',
            estherPart1:         'Частина 1',
            estherPart2:         'Частина 2',
            estherMobileNotice:  'На мобільних пристроях перегляд PDF на сторінці недоступний. Використовуйте кнопки вище, щоб відкрити або завантажити файл.',
            shareCopied:         'Посилання скопійовано',
            visitorLabel:        'Відвідувачів:',
            sections: {
                home:            '🏠 Головна',
                intro:           'Про проєкт',
                dvar_malchut:    'Двар Малхут',
                section_a:       'Розділ 1',
                section_b:       'Розділ 2',
                section_c:       'Розділ 3',
                halacha:         'Алаха',
                megilla_read:    'Читати Мегілу',
                esther_scroll:   'Читати текст Мегіли',
                maharash_scroll: 'Читати сувій Мегіли',
                tzedaka:         'Дати Цдаку',
                games:           'Ігри',
                dreidel:         'Гра в дрейдл 🎡',
                hangman:         'Повіш Амана! 🪢',
                spiral:          'На добраніч 🌀',
                alcohol:         'Алкогольний калькулятор 🍷',
                shum:            'Шуміти! 📣',
                megilla_listen:  '🎤 Слухати Мегілу',
                megilla_shop:    '📜 Придбати Мегілат Естер'
            },
            mlListen:        'Слухати',
            mlStop:          'Закінчити слухати',
            mlListening:     '🎙 Слухаю...',
            mlNotSupported:  'Ваш браузер не підтримує розпізнавання мови',
            mlMicDenied:     'Доступ до мікрофона заборонено',
            mlError:         'Помилка розпізнавання мови',
            mlChapter:       'Глава',
            mlDownload:      '⬇ Завантажити модуль розпізнавання мови (ок.100МБ)',
            mlDownloading:   '⏳ Завантаження модуля...',
            mlDownloadReady: '✅ Модуль завантажено та готово',
            mlDownloadError: '❌ Помилка завантаження модуля',
            mlModuleNotReady:'⚠ Спочатку завантажте модуль',
            mlDownloadConfirm:'Для завантаження модуля розпізнавання мови потрібно завантажити близько 100 МБ даних. Продовжити?',
            audioPlayerTitle: '🎧 Прослухати Мегілу',
            audioPlay:        '▶ Слухати',
            audioPause:       '⏸ Пауза',
            audioStop:        '⏹ Стоп',
            audioSpeed:       'Швидкість:',
            zoomIn:           'Збільшити',
            zoomOut:          'Зменшити'
        },

        de: {
            pageTitle:        'Purim-Fest',
            headerTitle:      'Purim — Fest des jüdischen Volkes, der Familie und der Kinder',
            progressLabel:    'abgeschlossen',
            dedication:       'Gewidmet der Erhebung der Seele von Irina bat Sara',
            sidebarTitle:     'Menu',
            quizHeader:       'Verständnis prüfen',
            quizSubmit:       'Antworten',
            quizAllCorrect:   'Alle Antworten richtig. Abschnitt abgeschlossen.',
            quizHasErrors:    'Es gibt Fehler. Bitte versuchen Sie es erneut.',
            quizAlreadyDone:  'Abschnitt bereits abgeschlossen.',
            footerDvarRights: 'Rechte an „Dvar Malchut" © 2026 Shluchim Office International',
            footerAudioRights:'Rechte an Audio und russischer Version der Megilla ©',
            footerPhotoRights:'Rechte an Fotos der Megilla des Rebbe Maharash ©',
            footerContact:    'Feedback und Kommentare:',
            footerCredit:     'Website erstellt von Rav Reuven Greenberg',
            footerCopyright:  '© Alle Rechte vorbehalten 2026',
            estherDesc:       'Wählen Sie oben die Sprache aus, um die Megillat Esther in der gewünschten Sprache zu öffnen. Sie können den Text direkt auf der Seite lesen oder die Datei herunterladen.',
            estherOpen:          'In neuem Tab öffnen',
            estherDownload:      'PDF herunterladen',
            estherPart1:         'Teil 1',
            estherPart2:         'Teil 2',
            estherMobileNotice:  'Auf mobilen Geräten ist die PDF-Anzeige auf der Seite nicht verfügbar. Verwenden Sie die Schaltflächen oben, um die Datei zu öffnen oder herunterzuladen.',
            shareCopied:         'Link kopiert',
            visitorLabel:        'Besucher:',
            sections: {
                home:            '🏠 Startseite',
                intro:           'Über das Projekt',
                dvar_malchut:    'Dvar Malchut',
                section_a:       'Abschnitt 1',
                section_b:       'Abschnitt 2',
                section_c:       'Abschnitt 3',
                halacha:         'Halacha',
                megilla_read:    'Megilla lesen',
                esther_scroll:   'Megilla-Text lesen',
                maharash_scroll: 'Megilla-Schriftrolle lesen',
                tzedaka:         'Zedaka geben',
                games:           'Spiele',
                dreidel:         'Dreidel-Spiel 🎡',
                hangman:         'Häng Haman auf! 🪢',
                spiral:          'Gute Nacht 🌀',
                alcohol:         'Alkohol-Kalkulator 🍷',
                shum:            'Lärm machen! 📣',
                megilla_listen:  '🎤 Megilla anhören',
                megilla_shop:    '📜 Megillat Esther erwerben'
            },
            mlListen:        'Anhören',
            mlStop:          'Aufhören zuzuhören',
            mlListening:     '🎙 Höre zu...',
            mlNotSupported:  'Ihr Browser unterstützt keine Spracherkennung',
            mlMicDenied:     'Mikrofonzugriff verweigert',
            mlError:         'Fehler bei der Spracherkennung',
            mlChapter:       'Kapitel',
            mlDownload:      '⬇ Spracherkennungsmodul herunterladen (ca.100 MB)',
            mlDownloading:   '⏳ Modul wird geladen...',
            mlDownloadReady: '✅ Modul geladen und bereit',
            mlDownloadError: '❌ Fehler beim Laden des Moduls',
            mlModuleNotReady:'⚠ Bitte laden Sie zuerst das Modul herunter',
            mlDownloadConfirm:'Zum Laden des Spracherkennungsmoduls müssen ca. 100 MB heruntergeladen werden. Fortfahren?',
            audioPlayerTitle: '🎧 Megilla anhören',
            audioPlay:        '▶ Abspielen',
            audioPause:       '⏸ Pause',
            audioStop:        '⏹ Stop',
            audioSpeed:       'Geschwindigkeit:',
            zoomIn:           'Vergrößern',
            zoomOut:          'Verkleinern'
        },

        en: {
            pageTitle:        'Purim — the Holiday of Divine Providence',
            headerTitle:      'Purim — the holiday of the Jewish people, family, and children',
            progressLabel:    'completed',
            dedication:       'Dedicated to the elevation of the soul of Irina bat Sara',
            sidebarTitle:     'Menu',
            quizHeader:       'Check your understanding',
            quizSubmit:       'Submit',
            quizAllCorrect:   'All answers are correct. Section completed.',
            quizHasErrors:    'There are errors. Please try again.',
            quizAlreadyDone:  'Section already completed.',
            footerDvarRights: 'Rights to "Dvar Malchut" © 2026 Shluchim Office International',
            footerAudioRights:'Rights to audio and Russian version of the Megilla ©',
            footerPhotoRights:'Rights to photos of the Megilla of Rebbe Maharash ©',
            footerContact:    'Feedback and comments:',
            footerCredit:     'Website created by Rav Reuven Greenberg',
            footerCopyright:  '© All rights reserved 2026',
            estherDesc:       'Select a language in the top menu to open the Megilla in the desired language. You can read the text directly on the page or download the file.',
            estherOpen:          'Open in new tab',
            estherDownload:      'Download PDF',
            estherPart1:         'Part 1',
            estherPart2:         'Part 2',
            estherMobileNotice:  'On mobile devices, viewing the PDF within the page is not available. Use the buttons above to open or download the file.',
            shareCopied:         'Link copied',
            visitorLabel:        'Visitors:',
            sections: {
                home:            '🏠 Home',
                intro:           'About the Project',
                dvar_malchut:    'Dvar Malchut',
                section_a:       'Section 1',
                section_b:       'Section 2',
                section_c:       'Section 3',
                halacha:         'Halacha',
                megilla_read:    'Read the Megilla',
                esther_scroll:   'Read Megilla text',
                maharash_scroll: 'Read Megilla scroll',
                tzedaka:         'Give Tzedaka',
                games:           'Games',
                dreidel:         'Dreidel game 🎡',
                hangman:         'Hang Haman! 🪢',
                spiral:          'Good night 🌀',
                alcohol:         'Alcohol calculator 🍷',
                shum:            'Make noise! 📣',
                megilla_listen:  '🎤 Listen to Megilla',
                megilla_shop:    '📜 Purchase Megillat Esther'
            },
            mlListen:        'Listen',
            mlStop:          'Stop listening',
            mlListening:     '🎙 Listening...',
            mlNotSupported:  'Your browser does not support speech recognition',
            mlMicDenied:     'Microphone access denied',
            mlError:         'Speech recognition error',
            mlChapter:       'Chapter',
            mlDownload:      '⬇ Download speech recognition module (≈100MB)',
            mlDownloading:   '⏳ Loading module...',
            mlDownloadReady: '✅ Module loaded and ready',
            mlDownloadError: '❌ Error loading module',
            mlModuleNotReady:'⚠ Please download the module first',
            mlDownloadConfirm:'To load the speech recognition module, about 100 MB of data needs to be downloaded. Continue?',
            audioPlayerTitle: '🎧 Listen to the Megilla',
            audioPlay:        '▶ Play',
            audioPause:       '⏸ Pause',
            audioStop:        '⏹ Stop',
            audioSpeed:       'Speed:',
            zoomIn:           'Zoom in',
            zoomOut:          'Zoom out'
        },

        he: {
            pageTitle:        'חג הפורים — שיעור אינטראקטיבי',
            headerTitle:      'פורים — חג עם ישראל, המשפחה והילדים',
            progressLabel:    'הושלם',
            dedication:       'לעילוי נשמת אירינה בת שרה',
            sidebarTitle:     'תפריט',
            quizHeader:       'בדוק הבנה',
            quizSubmit:       'ענה',
            quizAllCorrect:   'כל התשובות נכונות. הפרק הושלם.',
            quizHasErrors:    'יש שגיאות. נסה שוב.',
            quizAlreadyDone:  'הפרק כבר הושלם.',
            footerDvarRights: 'זכויות על "דבר מלכות" © 2026 Shluchim Office International',
            footerAudioRights:'זכויות על האודיו וגרסת המגילה הרוסית ©',
            footerPhotoRights:'זכויות על תמונות מגילת הרבי המהר"ש ©',
            footerContact:    'תגובות והערות:',
            footerCredit:     'האתר נבנה על ידי הרב ראובן גרינברג',
            footerCopyright:  '© כל הזכויות שמורות 2026',
            estherDesc:       'בחרו שפה בתפריט העליון כדי לפתוח את המגילה בשפה הרצויה. ניתן לקרוא את הטקסט ישירות בדף או להוריד את הקובץ.',
            estherOpen:          'פתח בלשונית חדשה',
            estherDownload:      'הורד PDF',
            estherPart1:         'חלק א׳',
            estherPart2:         'חלק ב׳',
            estherMobileNotice:  'במכשירים ניידים אין אפשרות לצפות ב-PDF בתוך הדף. השתמשו בכפתורים למעלה כדי לפתוח או להוריד את הקובץ.',
            shareCopied:         'הקישור הועתק',
            visitorLabel:        'מבקרים:',
            sections: {
                home:            '🏠 דף הבית',
                intro:           'אודות הפרויקט',
                dvar_malchut:    'דבר מלכות',
                section_a:       'פרק א׳',
                section_b:       'פרק ב׳',
                section_c:       'פרק ג׳',
                halacha:         'הלכה',
                megilla_read:    'קריאת מגילה',
                esther_scroll:   'קריאת טקסט המגילה',
                maharash_scroll: 'קריאת מגילת מהר״ש',
                tzedaka:         'תן צדקה',
                games:           'משחקים',
                dreidel:         'משחק סביבון 🎡',
                hangman:         'תלה את המן! 🪢',
                spiral:          'לילה טוב 🌀',
                alcohol:         'מחשבון אלכוהול 🍷',
                shum:            '!לעשות רעש 📣',
                megilla_listen:  '🎤 האזנה למגילה',
                megilla_shop:    '📜 רכישת מגילת אסתר'
            },
            mlListen:        'האזן',
            mlStop:          'סיים האזנה',
            mlListening:     '🎙 מאזין...',
            mlNotSupported:  'הדפדפן אינו תומך בזיהוי דיבור',
            mlMicDenied:     'הגישה למיקרופון נדחתה',
            mlError:         'שגיאה בזיהוי דיבור',
            mlChapter:       'פרק',
            mlDownload:      '⬇ הורד מודול זיהוי דיבור (≈100MB)',
            mlDownloading:   '⏳ טוען מודול...',
            mlDownloadReady: '✅ המודול נטען ומוכן',
            mlDownloadError: '❌ שגיאה בטעינת המודול',
            mlModuleNotReady:'⚠ יש להוריד תחילה את המודול',
            mlDownloadConfirm:'לטעינת מודול זיהוי הדיבור יש להוריד כ-100MB. להמשיך?',
            audioPlayerTitle: '🎧 האזנה למגילה',
            audioPlay:        '▶ השמע',
            audioPause:       '⏸ השהה',
            audioStop:        '⏹ עצור',
            audioSpeed:       'מהירות:',
            zoomIn:           'הגדל',
            zoomOut:          'הקטן'
        }

    };

    // Dual modes (ru-uk, ru-de) keep Russian UI
    function getUILang(langMode) {
        if (langMode === 'uk') return 'uk';
        if (langMode === 'de') return 'de';
        if (langMode === 'he') return 'he';
        if (langMode === 'en') return 'en';
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

        // HTML lang attribute and text direction for accessibility
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';

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
