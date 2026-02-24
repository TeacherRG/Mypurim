// ===== ALCOHOL CALCULATOR =====

function renderAlcoholCalculator() {
    contentArea.innerHTML = '';

    var uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

    var strings = {
        ru: {
            title:       'Алкогольный калькулятор',
            desc:        'Отслеживайте содержание алкоголя в крови и уровень трезвости на основе признанной во всём мире формулы Видмарка. Просто введите количество выпитого спиртного и позвольте приложению рассчитать содержание алкоголя в крови и уровень вашего опьянения. Оставайтесь безопасным и ответственным, хорошо проводя время.',
            yourData:    'Ваши данные',
            genderLabel: 'Пол',
            male:        'Мужской',
            female:      'Женский',
            weightLabel: 'Вес (кг)',
            drinksLabel: 'Выпитое',
            addDrink:    '+ Добавить напиток',
            timeLabel:   'Время с начала употребления (часов)',
            calcBtn:     'Рассчитать',
            resultTitle: 'Результат',
            bacLabel:    'Алкоголь в крови',
            levelLabel:  'Уровень опьянения',
            soberLabel:  'До полного отрезвления',
            soberHours:  'ч',
            levels: [
                { max: 0.3,        text: 'Трезвый',                   color: '#4caf50' },
                { max: 0.5,        text: 'Незначительное влияние',     color: '#8bc34a' },
                { max: 1.0,        text: 'Лёгкое опьянение',           color: '#f9c74f' },
                { max: 1.5,        text: 'Умеренное опьянение',        color: '#ff9800' },
                { max: 2.0,        text: 'Сильное опьянение',          color: '#ff5722' },
                { max: 3.0,        text: 'Очень сильное / опасно',     color: '#f44336' },
                { max: Infinity,   text: 'Угроза жизни!',              color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Пиво (500 мл, 5%)',             ml: 500, pct: 5  },
                { label: 'Пиво (330 мл, 5%)',             ml: 330, pct: 5  },
                { label: 'Вино (150 мл, 12%)',            ml: 150, pct: 12 },
                { label: 'Шампанское (150 мл, 11%)',      ml: 150, pct: 11 },
                { label: 'Водка / крепкие (50 мл, 40%)', ml: 50,  pct: 40 },
                { label: 'Другой напиток...',             ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'мл',
            customPct:   '% алк.',
            noData:      'Пожалуйста, введите корректный вес (30–200 кг)',
            noDrinks:    'Добавьте хотя бы один напиток',
            disclaimer:  'Калькулятор носит исключительно информационный характер. Не садитесь за руль, пока уровень алкоголя в крови не достигнет 0,0 ‰. Будьте ответственны!',
            removeBtn:   'Удалить'
        },
        uk: {
            title:       'Алкогольний калькулятор',
            desc:        'Відстежуйте вміст алкоголю в крові та рівень тверезості на основі визнаної в усьому світі формули Відмарка. Просто введіть кількість випитого спиртного і дозвольте застосунку розрахувати вміст алкоголю в крові та рівень вашого сп\'яніння. Залишайтеся безпечним і відповідальним, добре проводячи час.',
            yourData:    'Ваші дані',
            genderLabel: 'Стать',
            male:        'Чоловіча',
            female:      'Жіноча',
            weightLabel: 'Вага (кг)',
            drinksLabel: 'Випито',
            addDrink:    '+ Додати напій',
            timeLabel:   'Час з початку вживання (годин)',
            calcBtn:     'Розрахувати',
            resultTitle: 'Результат',
            bacLabel:    'Алкоголь у крові',
            levelLabel:  'Рівень сп\'яніння',
            soberLabel:  'До повного протверезіння',
            soberHours:  'год',
            levels: [
                { max: 0.3,        text: 'Тверезий',                  color: '#4caf50' },
                { max: 0.5,        text: 'Незначний вплив',            color: '#8bc34a' },
                { max: 1.0,        text: 'Легке сп\'яніння',           color: '#f9c74f' },
                { max: 1.5,        text: 'Помірне сп\'яніння',         color: '#ff9800' },
                { max: 2.0,        text: 'Сильне сп\'яніння',          color: '#ff5722' },
                { max: 3.0,        text: 'Дуже сильне / небезпечно',  color: '#f44336' },
                { max: Infinity,   text: 'Загроза життю!',             color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Пиво (500 мл, 5%)',               ml: 500, pct: 5  },
                { label: 'Пиво (330 мл, 5%)',               ml: 330, pct: 5  },
                { label: 'Вино (150 мл, 12%)',              ml: 150, pct: 12 },
                { label: 'Шампанське (150 мл, 11%)',        ml: 150, pct: 11 },
                { label: 'Горілка / міцні (50 мл, 40%)',   ml: 50,  pct: 40 },
                { label: 'Інший напій...',                  ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'мл',
            customPct:   '% алк.',
            noData:      'Будь ласка, введіть коректну вагу (30–200 кг)',
            noDrinks:    'Додайте хоча б один напій',
            disclaimer:  'Калькулятор має виключно інформаційний характер. Не сідайте за кермо, поки рівень алкоголю в крові не досягне 0,0 ‰. Будьте відповідальні!',
            removeBtn:   'Видалити'
        },
        de: {
            title:       'Alkohol-Kalkulator',
            desc:        'Verfolgen Sie Ihren Blutalkoholgehalt und Nüchternheitsgrad basierend auf der weltweit anerkannten Widmark-Formel. Geben Sie einfach die Menge des konsumierten Alkohols ein und lassen Sie die App Ihren Blutalkoholgehalt und Rauschgrad berechnen. Bleiben Sie sicher und verantwortungsbewusst.',
            yourData:    'Ihre Daten',
            genderLabel: 'Geschlecht',
            male:        'Männlich',
            female:      'Weiblich',
            weightLabel: 'Gewicht (kg)',
            drinksLabel: 'Getränke',
            addDrink:    '+ Getränk hinzufügen',
            timeLabel:   'Zeit seit dem ersten Drink (Stunden)',
            calcBtn:     'Berechnen',
            resultTitle: 'Ergebnis',
            bacLabel:    'Blutalkohol (BAK)',
            levelLabel:  'Rauschgrad',
            soberLabel:  'Bis zur Nüchternheit',
            soberHours:  'Std.',
            levels: [
                { max: 0.3,        text: 'Nüchtern',                   color: '#4caf50' },
                { max: 0.5,        text: 'Geringfügiger Einfluss',      color: '#8bc34a' },
                { max: 1.0,        text: 'Leichte Trunkenheit',         color: '#f9c74f' },
                { max: 1.5,        text: 'Mäßige Trunkenheit',          color: '#ff9800' },
                { max: 2.0,        text: 'Starke Trunkenheit',          color: '#ff5722' },
                { max: 3.0,        text: 'Sehr stark / gefährlich',     color: '#f44336' },
                { max: Infinity,   text: 'Lebensgefahr!',               color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'Bier (500 ml, 5%)',              ml: 500, pct: 5  },
                { label: 'Bier (330 ml, 5%)',              ml: 330, pct: 5  },
                { label: 'Wein (150 ml, 12%)',             ml: 150, pct: 12 },
                { label: 'Sekt (150 ml, 11%)',             ml: 150, pct: 11 },
                { label: 'Vodka / Schnaps (50 ml, 40%)',   ml: 50,  pct: 40 },
                { label: 'Anderes Getränk...',             ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'ml',
            customPct:   '% Alk.',
            noData:      'Bitte geben Sie ein gültiges Gewicht ein (30–200 kg)',
            noDrinks:    'Bitte fügen Sie mindestens ein Getränk hinzu',
            disclaimer:  'Dieser Rechner dient nur zu Informationszwecken. Fahren Sie kein Fahrzeug, bis Ihr BAK 0,0 ‰ erreicht. Bleiben Sie verantwortungsbewusst!',
            removeBtn:   'Löschen'
        },
        he: {
            title:       'מחשבון אלכוהול',
            desc:        'עקוב אחר רמת האלכוהול בדם ומידת הפיכחון על בסיס נוסחת וידמארק המוכרת בעולם. הזן את כמות המשקאות האלכוהוליים שצרכת ותן לאפליקציה לחשב את רמת האלכוהול בדמך ומידת השכרות שלך. הישאר בטוח ואחראי.',
            yourData:    'הנתונים שלך',
            genderLabel: 'מין',
            male:        'זכר',
            female:      'נקבה',
            weightLabel: 'משקל (ק"ג)',
            drinksLabel: 'שתייה',
            addDrink:    '+ הוסף משקה',
            timeLabel:   'זמן מתחילת השתייה (שעות)',
            calcBtn:     'חשב',
            resultTitle: 'תוצאה',
            bacLabel:    'אלכוהול בדם',
            levelLabel:  'רמת שכרות',
            soberLabel:  'עד להתפכחות מלאה',
            soberHours:  'שע׳',
            levels: [
                { max: 0.3,        text: 'פיכח',                        color: '#4caf50' },
                { max: 0.5,        text: 'השפעה קלה',                   color: '#8bc34a' },
                { max: 1.0,        text: 'שכרות קלה',                   color: '#f9c74f' },
                { max: 1.5,        text: 'שכרות מתונה',                 color: '#ff9800' },
                { max: 2.0,        text: 'שכרות חזקה',                  color: '#ff5722' },
                { max: 3.0,        text: 'שכרות חמורה / מסוכן',        color: '#f44336' },
                { max: Infinity,   text: 'סכנת חיים!',                  color: '#b71c1c' }
            ],
            drinkTypes: [
                { label: 'בירה (500 מ"ל, 5%)',               ml: 500, pct: 5  },
                { label: 'בירה (330 מ"ל, 5%)',               ml: 330, pct: 5  },
                { label: 'יין (150 מ"ל, 12%)',               ml: 150, pct: 12 },
                { label: 'שמפניה (150 מ"ל, 11%)',            ml: 150, pct: 11 },
                { label: 'וודקה / חריפים (50 מ"ל, 40%)',    ml: 50,  pct: 40 },
                { label: 'משקה אחר...',                      ml: 0,   pct: 0, custom: true }
            ],
            customMl:    'מ"ל',
            customPct:   '% אלכ.',
            noData:      'אנא הזן משקל תקין (30–200 ק"ג)',
            noDrinks:    'הוסף לפחות משקה אחד',
            disclaimer:  'המחשבון מיועד למטרות מידע בלבד. אל תנהג עד שרמת האלכוהול בדמך תגיע ל-0.0 ‰. היה אחראי!',
            removeBtn:   'הסר'
        }
    };

    var s = strings[uiLang];

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + s.title + '</h1>';
    contentArea.appendChild(titleBar);

    // Description
    var desc = document.createElement('p');
    desc.className = 'alcohol-desc';
    desc.textContent = s.desc;
    contentArea.appendChild(desc);

    // Main card
    var card = document.createElement('div');
    card.className = 'alcohol-card';
    contentArea.appendChild(card);

    // ─── Personal data ───────────────────────────────────────────
    var personalSection = document.createElement('div');
    personalSection.className = 'alcohol-section';

    var personalTitle = document.createElement('h3');
    personalTitle.className = 'alcohol-section-title';
    personalTitle.textContent = s.yourData;
    personalSection.appendChild(personalTitle);

    // Gender selector
    var genderRow = document.createElement('div');
    genderRow.className = 'alcohol-row';

    var genderLabelEl = document.createElement('label');
    genderLabelEl.className = 'alcohol-label';
    genderLabelEl.textContent = s.genderLabel;
    genderRow.appendChild(genderLabelEl);

    var genderBtns = document.createElement('div');
    genderBtns.className = 'alcohol-gender-btns';

    var selectedGender = 'male';

    var maleBtn = document.createElement('button');
    maleBtn.className = 'alcohol-gender-btn active';
    maleBtn.type = 'button';
    maleBtn.textContent = s.male;

    var femaleBtn = document.createElement('button');
    femaleBtn.className = 'alcohol-gender-btn';
    femaleBtn.type = 'button';
    femaleBtn.textContent = s.female;

    maleBtn.addEventListener('click', function () {
        selectedGender = 'male';
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    });
    femaleBtn.addEventListener('click', function () {
        selectedGender = 'female';
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    });

    genderBtns.appendChild(maleBtn);
    genderBtns.appendChild(femaleBtn);
    genderRow.appendChild(genderBtns);
    personalSection.appendChild(genderRow);

    // Weight input
    var weightRow = document.createElement('div');
    weightRow.className = 'alcohol-row';

    var weightLabelEl = document.createElement('label');
    weightLabelEl.className = 'alcohol-label';
    weightLabelEl.textContent = s.weightLabel;

    var weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.className = 'alcohol-input';
    weightInput.min = '30';
    weightInput.max = '200';
    weightInput.placeholder = '70';

    weightRow.appendChild(weightLabelEl);
    weightRow.appendChild(weightInput);
    personalSection.appendChild(weightRow);
    card.appendChild(personalSection);

    // ─── Drinks ──────────────────────────────────────────────────
    var drinksSection = document.createElement('div');
    drinksSection.className = 'alcohol-section';

    var drinksSectionTitle = document.createElement('h3');
    drinksSectionTitle.className = 'alcohol-section-title';
    drinksSectionTitle.textContent = s.drinksLabel;
    drinksSection.appendChild(drinksSectionTitle);

    var drinksList = document.createElement('div');
    drinksList.className = 'alcohol-drinks-list';
    drinksSection.appendChild(drinksList);

    var addDrinkBtn = document.createElement('button');
    addDrinkBtn.className = 'alcohol-add-btn';
    addDrinkBtn.type = 'button';
    addDrinkBtn.textContent = s.addDrink;
    drinksSection.appendChild(addDrinkBtn);

    function addDrinkRow() {
        var drinkRow = document.createElement('div');
        drinkRow.className = 'alcohol-drink-row';

        var typeSelect = document.createElement('select');
        typeSelect.className = 'alcohol-drink-select';
        s.drinkTypes.forEach(function (dt, idx) {
            var opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = dt.label;
            typeSelect.appendChild(opt);
        });

        var customMlInput = document.createElement('input');
        customMlInput.type = 'number';
        customMlInput.className = 'alcohol-drink-custom';
        customMlInput.placeholder = s.customMl;
        customMlInput.min = '1';
        customMlInput.max = '2000';
        customMlInput.style.display = 'none';

        var customPctInput = document.createElement('input');
        customPctInput.type = 'number';
        customPctInput.className = 'alcohol-drink-custom';
        customPctInput.placeholder = s.customPct;
        customPctInput.min = '0.1';
        customPctInput.max = '96';
        customPctInput.step = '0.1';
        customPctInput.style.display = 'none';

        typeSelect.addEventListener('change', function () {
            var isCustom = s.drinkTypes[parseInt(typeSelect.value)].custom;
            customMlInput.style.display  = isCustom ? '' : 'none';
            customPctInput.style.display = isCustom ? '' : 'none';
        });

        var removeBtn = document.createElement('button');
        removeBtn.className = 'alcohol-remove-btn';
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.title = s.removeBtn;
        removeBtn.addEventListener('click', function () {
            drinksList.removeChild(drinkRow);
        });

        drinkRow.appendChild(typeSelect);
        drinkRow.appendChild(customMlInput);
        drinkRow.appendChild(customPctInput);
        drinkRow.appendChild(removeBtn);
        drinksList.appendChild(drinkRow);
    }

    addDrinkBtn.addEventListener('click', addDrinkRow);
    addDrinkRow(); // start with one row

    card.appendChild(drinksSection);

    // ─── Time elapsed ─────────────────────────────────────────────
    var timeSection = document.createElement('div');
    timeSection.className = 'alcohol-section';

    var timeRow = document.createElement('div');
    timeRow.className = 'alcohol-row';

    var timeLabelEl = document.createElement('label');
    timeLabelEl.className = 'alcohol-label';
    timeLabelEl.textContent = s.timeLabel;

    var timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.className = 'alcohol-input';
    timeInput.min = '0';
    timeInput.max = '24';
    timeInput.step = '0.5';
    timeInput.value = '0';

    timeRow.appendChild(timeLabelEl);
    timeRow.appendChild(timeInput);
    timeSection.appendChild(timeRow);
    card.appendChild(timeSection);

    // ─── Calculate button ─────────────────────────────────────────
    var calcBtn = document.createElement('button');
    calcBtn.className = 'alcohol-calc-btn';
    calcBtn.type = 'button';
    calcBtn.textContent = s.calcBtn;
    card.appendChild(calcBtn);

    // ─── Result area ──────────────────────────────────────────────
    var resultArea = document.createElement('div');
    resultArea.className = 'alcohol-result';
    resultArea.style.display = 'none';
    card.appendChild(resultArea);

    calcBtn.addEventListener('click', function () {
        var weight = parseFloat(weightInput.value);
        if (!weight || weight < 30 || weight > 200) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = '<p class="alcohol-error">' + s.noData + '</p>';
            return;
        }

        var drinkRows = drinksList.querySelectorAll('.alcohol-drink-row');
        if (drinkRows.length === 0) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = '<p class="alcohol-error">' + s.noDrinks + '</p>';
            return;
        }

        // Total pure alcohol in grams (density of ethanol ≈ 0.789 g/ml)
        var totalAlcohol = 0;
        drinkRows.forEach(function (row) {
            var sel = row.querySelector('select');
            var idx = parseInt(sel.value);
            var dt  = s.drinkTypes[idx];
            var ml, pct;
            if (dt.custom) {
                var inputs = row.querySelectorAll('.alcohol-drink-custom');
                ml  = parseFloat(inputs[0].value) || 0;
                pct = parseFloat(inputs[1].value) || 0;
            } else {
                ml  = dt.ml;
                pct = dt.pct;
            }
            totalAlcohol += ml * (pct / 100) * 0.789;
        });

        // Widmark formula: BAC (‰) = A / (r × W) − β × t
        var r    = selectedGender === 'male' ? 0.7 : 0.6;
        var beta = 0.15; // ‰ per hour
        var t    = Math.max(0, parseFloat(timeInput.value) || 0);
        var bac  = Math.max(0, (totalAlcohol / (r * weight)) - beta * t);

        // Intoxication level
        var level = s.levels[s.levels.length - 1];
        for (var i = 0; i < s.levels.length; i++) {
            if (bac < s.levels[i].max) { level = s.levels[i]; break; }
        }

        // Hours to sober
        var soberTime = bac > 0 ? (bac / beta).toFixed(1) : '0';

        resultArea.style.display = 'block';
        resultArea.innerHTML =
            '<h3 class="alcohol-result-title">' + s.resultTitle + '</h3>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.bacLabel + '</span>' +
                '<span class="alcohol-result-value">' + bac.toFixed(2) + ' ‰</span>' +
            '</div>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.levelLabel + '</span>' +
                '<span class="alcohol-result-level" style="background:' + level.color + '">' + level.text + '</span>' +
            '</div>' +
            '<div class="alcohol-result-row">' +
                '<span class="alcohol-result-label">' + s.soberLabel + '</span>' +
                '<span class="alcohol-result-value">' + soberTime + ' ' + s.soberHours + '</span>' +
            '</div>' +
            '<p class="alcohol-disclaimer">' + s.disclaimer + '</p>';
    });
}
