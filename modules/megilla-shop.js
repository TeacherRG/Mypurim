// ===== MEGILLA SHOP SECTION =====

function getMegillaShopFile(lang) {
    if (lang === 'uk') return 'MegillaShop/megilla-shop-uk.json';
    if (lang === 'de') return 'MegillaShop/megilla-shop-de.json';
    if (lang === 'he') return 'MegillaShop/megilla-shop-he.json';
    return 'MegillaShop/megilla-shop-ru.json';
}

async function renderMegillaShop() {
    contentArea.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('megilla_shop', langMode);
    contentArea.appendChild(h2);

    const isDual = langMode.includes('-');

    if (isDual) {
        var lang2 = langMode.split('-')[1];
        var results = await Promise.all([
            fetch(getMegillaShopFile('ru')).then(function (r) { return r.json(); }),
            fetch(getMegillaShopFile(lang2)).then(function (r) { return r.json(); })
        ]);
        var dataRu = results[0];
        var dataLang = results[1];

        var dual = document.createElement('div');
        dual.className = 'lang-dual';
        contentArea.appendChild(dual);

        var leftCol = document.createElement('div');
        leftCol.className = 'lang-col';
        renderMegillaShopData(leftCol, dataRu);
        dual.appendChild(leftCol);

        var rightCol = document.createElement('div');
        rightCol.className = 'lang-col lang-col-right';
        renderMegillaShopData(rightCol, dataLang);
        dual.appendChild(rightCol);
    } else {
        var lang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';
        var resp = await fetch(getMegillaShopFile(lang));
        var data = await resp.json();
        var col = document.createElement('div');
        col.className = 'lang-col';
        renderMegillaShopData(col, data);
        contentArea.appendChild(col);
    }
}

function renderMegillaShopData(container, data) {
    if (!data.sections) return;

    data.sections.forEach(function (section) {
        var card = document.createElement('div');
        card.className = 'megilla-shop-card';

        var header = document.createElement('div');
        header.className = 'megilla-shop-header';

        if (section.icon) {
            var iconSpan = document.createElement('span');
            iconSpan.className = 'megilla-shop-icon';
            iconSpan.textContent = section.icon;
            header.appendChild(iconSpan);
        }

        if (section.title) {
            var titleEl = document.createElement('h3');
            titleEl.className = 'megilla-shop-title';
            titleEl.textContent = section.title;
            header.appendChild(titleEl);
        }

        card.appendChild(header);

        if (section.items) {
            section.items.forEach(function (item) {
                if (item.type === 'paragraph') {
                    var p = document.createElement('p');
                    p.className = 'megilla-shop-text';
                    p.textContent = item.text;
                    card.appendChild(p);
                } else if (item.type === 'list') {
                    var ul = document.createElement('ul');
                    ul.className = 'megilla-shop-list';
                    item.content.forEach(function (text) {
                        var li = document.createElement('li');
                        li.textContent = text;
                        ul.appendChild(li);
                    });
                    card.appendChild(ul);
                } else if (item.type === 'contact') {
                    var contactDiv = document.createElement('div');
                    contactDiv.className = 'megilla-shop-contact';
                    var link = document.createElement('a');
                    link.href = 'mailto:' + item.email;
                    link.className = 'megilla-shop-email';
                    link.textContent = item.email;
                    contactDiv.appendChild(link);
                    card.appendChild(contactDiv);
                }
            });
        }

        container.appendChild(card);
    });
}
