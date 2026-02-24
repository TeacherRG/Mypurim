// ===== TZEDAKA / DONATE SECTION =====

function renderTzedaka() {
    contentArea.innerHTML = '';

    const uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

    const strings = {
        ru: {
            title:      'Дать Цдаку',
            intro:      'Давать Цдаку (пожертвование) — одна из главных заповедей праздника Пурим. В этот день принято поддерживать еврейские общины, которые несут свет Торы. Ваш вклад имеет значение.',
            btn:        'Пожертвовать',
            viennaName: 'Еврейская община Вены',
            viennaOrg:  'JRCV',
            viennaDesc: 'Поддержите еврейскую общину Вены — одну из старейших и активных общин Европы, объединяющую сотни семей.',
            dniproName: 'Еврейская община Днепра',
            dniproOrg:  '',
            dniproDesc: 'Поддержите еврейскую общину Днепра — живой центр еврейской жизни на Украине.'
        },
        uk: {
            title:      'Дати Цдаку',
            intro:      'Давати Цдаку (пожертву) — одна з головних заповідей свята Пурим. Цього дня прийнято підтримувати єврейські громади, які несуть світло Тори. Ваш внесок має значення.',
            btn:        'Пожертвувати',
            viennaName: 'Єврейська громада Відня',
            viennaOrg:  'JRCV',
            viennaDesc: 'Підтримайте єврейську громаду Відня — одну з найстаріших та активних громад Європи, що об\'єднує сотні родин.',
            dniproName: 'Єврейська громада Дніпра',
            dniproOrg:  '',
            dniproDesc: 'Підтримайте єврейську громаду Дніпра — живий центр єврейського життя в Україні.'
        },
        de: {
            title:      'Zedaka geben',
            intro:      'Zedaka zu geben ist eines der wichtigsten Gebote von Purim. An diesem Tag ist es üblich, jüdische Gemeinden zu unterstützen, die das Licht der Tora tragen. Ihr Beitrag ist bedeutsam.',
            btn:        'Spenden',
            viennaName: 'Jüdische Gemeinde Wien',
            viennaOrg:  'JRCV',
            viennaDesc: 'Unterstützen Sie die Jüdische Gemeinde Wien — eine der ältesten und aktivsten Gemeinden Europas, die Hunderte von Familien vereint.',
            dniproName: 'Jüdische Gemeinde Dnipro',
            dniproOrg:  '',
            dniproDesc: 'Unterstützen Sie die Jüdische Gemeinde Dnipro — das lebendige Zentrum des jüdischen Lebens in der Ukraine.'
        },
        he: {
            title:      'תן צדקה',
            intro:      'נתינת צדקה היא אחת המצוות המרכזיות של חג הפורים. ביום זה נהוג לתמוך בקהילות יהודיות הנושאות את אור התורה. תרומתכם משמעותית.',
            btn:        'תרום',
            viennaName: 'הקהילה היהודית בווינה',
            viennaOrg:  'JRCV',
            viennaDesc: 'תמכו בקהילה היהודית בווינה — אחת הקהילות העתיקות והפעילות ביותר באירופה, המאגדת מאות משפחות.',
            dniproName: 'הקהילה היהודית בדניפרו',
            dniproOrg:  '',
            dniproDesc: 'תמכו בקהילה היהודית בדניפרו — המרכז החי של החיים היהודיים באוקראינה.'
        }
    };

    var s = strings[uiLang];

    var h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = s.title;
    contentArea.appendChild(h2);

    var intro = document.createElement('p');
    intro.className = 'donate-intro';
    intro.textContent = s.intro;
    contentArea.appendChild(intro);

    var grid = document.createElement('div');
    grid.className = 'donate-grid';

    grid.appendChild(buildDonateCard({
        flag:     '\uD83C\uDDE6\uD83C\uDDF9',
        name:     s.viennaName,
        org:      s.viennaOrg,
        desc:     s.viennaDesc,
        btnText:  s.btn,
        href:     'https://donate.stripe.com/cN2dRw8b31T4gHm7ss'
    }));

    grid.appendChild(buildDonateCard({
        flag:     '\uD83C\uDDFA\uD83C\uDDE6',
        name:     s.dniproName,
        org:      s.dniproOrg,
        desc:     s.dniproDesc,
        btnText:  s.btn,
        href:     'https://www.portmone.com.ua/r3/pg/4ly2syh1dc00g4gccwg0ccgcokc4sw4?is=30303332462499f3524caf64bc3b954adcc10cef9c3c28a8e07730c61c0428d7a7e1b61150eb83427f46b0af&py=&h=ce774ffda6f170c231868393413f22d7'
    }));

    contentArea.appendChild(grid);
}

function buildDonateCard(opts) {
    var card = document.createElement('div');
    card.className = 'donate-card';

    // Header
    var header = document.createElement('div');
    header.className = 'donate-card-header';

    var flag = document.createElement('div');
    flag.className = 'donate-card-flag';
    flag.textContent = opts.flag;
    header.appendChild(flag);

    var name = document.createElement('h3');
    name.className = 'donate-card-name';
    name.textContent = opts.name;
    header.appendChild(name);

    if (opts.org) {
        var org = document.createElement('p');
        org.className = 'donate-card-org';
        org.textContent = opts.org;
        header.appendChild(org);
    }

    card.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'donate-card-body';

    var desc = document.createElement('p');
    desc.className = 'donate-card-desc';
    desc.textContent = opts.desc;
    body.appendChild(desc);

    var btn = document.createElement('a');
    btn.className = 'donate-btn';
    btn.href = opts.href;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    var icon = document.createElement('span');
    icon.className = 'donate-btn-icon';
    icon.textContent = '\u2764\uFE0F';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(opts.btnText));

    body.appendChild(btn);
    card.appendChild(body);

    return card;
}
