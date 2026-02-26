// ===== HALACHA SECTION =====

function getHalachaFile(lang) {
    if (lang === 'uk') return 'Halacha/halacha-uk.json';
    if (lang === 'de') return 'Halacha/halacha-de.json';
    if (lang === 'he') return 'Halacha/halacha-he.json';
    if (lang === 'en') return 'Halacha/halacha-en.json';
    return 'Halacha/halacha-ru.json';
}

async function renderHalacha() {
    contentArea.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('halacha', langMode);
    contentArea.appendChild(h2);

    const isDual = langMode.includes('-');

    if (isDual) {
        const lang2 = langMode.split('-')[1]; // 'uk' or 'de'
        const results = await Promise.all([
            fetch(getHalachaFile('ru')).then(function (r) { return r.json(); }),
            fetch(getHalachaFile(lang2)).then(function (r) { return r.json(); })
        ]);
        const dataRu = results[0];
        const dataLang = results[1];

        const dual = document.createElement('div');
        dual.className = 'lang-dual';
        contentArea.appendChild(dual);

        const leftCol = document.createElement('div');
        leftCol.className = 'lang-col';
        renderHalachaData(leftCol, dataRu);
        dual.appendChild(leftCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'lang-col lang-col-right';
        renderHalachaData(rightCol, dataLang);
        dual.appendChild(rightCol);
    } else {
        var langMap = { uk: 'uk', de: 'de', he: 'he', en: 'en' };
        var lang = langMap[langMode] || 'ru';
        const resp = await fetch(getHalachaFile(lang));
        const data = await resp.json();
        const col = document.createElement('div');
        col.className = 'lang-col';
        renderHalachaData(col, data);
        contentArea.appendChild(col);
    }
}

function renderHalachaData(container, data) {
    // Show meta: calendar/title and source
    const metaTitle = data.calendar_cycle || data.titel || data['назва'] || '';
    const metaSource = data.source_material || data.herausgeber || data['видавництво'] || '';
    if (metaTitle || metaSource) {
        const meta = document.createElement('p');
        meta.className = 'halacha-meta';
        meta.textContent = [metaTitle, metaSource].filter(Boolean).join(' — ');
        container.appendChild(meta);
    }

    // Get the main schedule list/object
    const schedule = data.schedule || data.gesetze || data['закони'];
    if (Array.isArray(schedule)) {
        schedule.forEach(function (day) { renderHalachaDay(container, day); });
    } else if (schedule && typeof schedule === 'object') {
        Object.values(schedule).forEach(function (day) { renderHalachaDay(container, day); });
    }

    // Extras: special_instructions_for_mivtzoim (RU) or wichtige_notiz (DE)
    var extras = data.special_instructions_for_mivtzoim || data.wichtige_notiz;
    if (extras) {
        var extraDiv = document.createElement('div');
        extraDiv.className = 'halacha-extras';
        renderHalachaNode(extraDiv, extras);
        container.appendChild(extraDiv);
    }
}

function renderHalachaDay(container, day) {
    var eventName = day.event || day.ereignis || day['\u043f\u043e\u0434\u0456\u044f'] || '';
    var dateName  = day['\u0434\u0430\u0442\u0430'] || day.datum || '';
    var label = [dateName, eventName].filter(Boolean).join(' — ');

    var section = document.createElement('div');
    section.className = 'halacha-day';

    var header = document.createElement('div');
    header.className = 'halacha-day-header';
    header.textContent = label;

    var body = document.createElement('div');
    body.className = 'halacha-day-body open';

    header.addEventListener('click', function () {
        body.classList.toggle('open');
        section.classList.toggle('collapsed');
    });

    // Render each sub-property, skipping the event/date keys
    var skipKeys = ['event', 'ereignis', '\u043f\u043e\u0434\u0456\u044f', '\u0434\u0430\u0442\u0430', 'datum'];
    Object.entries(day).forEach(function (entry) {
        var key = entry[0];
        var value = entry[1];
        if (skipKeys.includes(key)) return;
        var topicDiv = document.createElement('div');
        topicDiv.className = 'halacha-topic';
        var topicHead = document.createElement('h4');
        topicHead.className = 'halacha-topic-head';
        topicHead.textContent = key.replace(/_/g, ' ');
        topicDiv.appendChild(topicHead);
        renderHalachaNode(topicDiv, value);
        body.appendChild(topicDiv);
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
}

function renderHalachaNode(container, value) {
    if (typeof value === 'string') {
        var p = document.createElement('p');
        p.className = 'halacha-text';
        p.textContent = value;
        container.appendChild(p);
    } else if (Array.isArray(value)) {
        var ul = document.createElement('ul');
        ul.className = 'halacha-list';
        value.forEach(function (item) {
            var li = document.createElement('li');
            if (typeof item === 'string') {
                li.textContent = item;
            } else {
                renderHalachaNode(li, item);
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
    } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(function (entry) {
            var key = entry[0];
            var val = entry[1];
            var sub = document.createElement('div');
            sub.className = 'halacha-sub';
            var subHead = document.createElement('h5');
            subHead.className = 'halacha-sub-head';
            subHead.textContent = key.replace(/_/g, ' ');
            sub.appendChild(subHead);
            renderHalachaNode(sub, val);
            container.appendChild(sub);
        });
    }
}
