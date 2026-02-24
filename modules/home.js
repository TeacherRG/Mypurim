// ===== HOME PAGE =====

function renderHome() {
    contentArea.innerHTML = '';

    const tiles = [
        {
            id: 'shum',
            emoji: '📣',
            colorFrom: '#d63384',
            colorTo:   '#a0185a'
        },
        {
            id: 'tzedaka',
            emoji: '💛',
            colorFrom: '#f5a623',
            colorTo:   '#c07800'
        },
        {
            id: 'esther_scroll',
            emoji: '📜',
            colorFrom: '#7b4fa8',
            colorTo:   '#4e2a80'
        },
        {
            id: 'alcohol',
            emoji: '🍷',
            colorFrom: '#c0392b',
            colorTo:   '#7b1c14'
        }
    ];

    const grid = document.createElement('div');
    grid.className = 'home-grid';

    tiles.forEach(function (tile) {
        const btn = document.createElement('button');
        btn.className = 'home-tile';
        btn.style.background = 'linear-gradient(145deg, ' + tile.colorFrom + ', ' + tile.colorTo + ')';

        const emoji = document.createElement('div');
        emoji.className = 'home-tile-emoji';
        emoji.textContent = tile.emoji;

        const title = document.createElement('div');
        title.className = 'home-tile-title';
        title.textContent = I18N.sectionTitle(tile.id, langMode);

        btn.appendChild(emoji);
        btn.appendChild(title);

        btn.addEventListener('click', function () {
            loadSection(tile.id);
        });

        grid.appendChild(btn);
    });

    contentArea.appendChild(grid);
}
