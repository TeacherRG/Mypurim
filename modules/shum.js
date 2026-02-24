// ===== SHUM / NOISE GAME =====

function renderShumGame() {
    contentArea.innerHTML = '';

    var uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';

    var labelsMap = {
        ru: {
            sounds: [
                { name: 'Паровозик',  emoji: '🚂' },
                { name: 'Шумелка',    emoji: '🎉' },
                { name: 'Игрушки',    emoji: '🧸' },
                { name: 'Гремелка',   emoji: '🪘' }
            ]
        },
        uk: {
            sounds: [
                { name: 'Паровозик',  emoji: '🚂' },
                { name: 'Шумілка',    emoji: '🎉' },
                { name: 'Іграшки',    emoji: '🧸' },
                { name: 'Гриміт',     emoji: '🪘' }
            ]
        },
        de: {
            sounds: [
                { name: 'Lokomotive', emoji: '🚂' },
                { name: 'Rassel',     emoji: '🎉' },
                { name: 'Spielzeug',  emoji: '🧸' },
                { name: 'Klapper',    emoji: '🪘' }
            ]
        },
        he: {
            sounds: [
                { name: 'קטר',        emoji: '🚂' },
                { name: 'רעשן',       emoji: '🎉' },
                { name: 'צעצועים',    emoji: '🧸' },
                { name: 'פורימשפיל', emoji: '🪘' }
            ]
        }
    };

    var labels = labelsMap[uiLang];

    var files = [
        'audio/Shum/' + encodeURIComponent('Гудок игрушечного паровоза.mp3'),
        'audio/Shum/' + encodeURIComponent('Игрушка-шумелка_ крутящаяся шумелка металлическая.mp3'),
        'audio/Shum/' + encodeURIComponent('Игрушки_ много детских игрушек-шумелок, гудят и пищат.mp3'),
        'audio/Shum/' + encodeURIComponent('Шумящая игрушка.wav')
    ];

    var colors = [
        { bg: '#c0392b', shadow: '#922b21' },
        { bg: '#2471a3', shadow: '#1a5276' },
        { bg: '#1e8449', shadow: '#145a32' },
        { bg: '#d68910', shadow: '#9a6107' }
    ];

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('shum', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    // Grid container
    var grid = document.createElement('div');
    grid.className = 'shum-grid';
    contentArea.appendChild(grid);

    var audios = [];
    var activeIndex = -1;

    labels.sounds.forEach(function(sound, i) {
        var tile = document.createElement('button');
        tile.className = 'shum-tile';
        tile.style.setProperty('--shum-bg', colors[i].bg);
        tile.style.setProperty('--shum-shadow', colors[i].shadow);

        var ripple = document.createElement('div');
        ripple.className = 'shum-ripple';
        tile.appendChild(ripple);

        var emoji = document.createElement('div');
        emoji.className = 'shum-emoji';
        emoji.textContent = sound.emoji;

        var name = document.createElement('div');
        name.className = 'shum-name';
        name.textContent = sound.name;

        tile.appendChild(emoji);
        tile.appendChild(name);
        grid.appendChild(tile);

        var audio = new Audio();
        audio.src = files[i];
        audio.loop = true;
        audio.volume = 1;
        audios.push(audio);

        tile.addEventListener('click', function() {
            if (activeIndex === i) {
                // Stop this sound
                audio.pause();
                audio.currentTime = 0;
                tile.classList.remove('shum-active');
                activeIndex = -1;
            } else {
                // Stop previous if any
                if (activeIndex >= 0) {
                    audios[activeIndex].pause();
                    audios[activeIndex].currentTime = 0;
                    grid.children[activeIndex].classList.remove('shum-active');
                }
                // Play new sound
                audio.currentTime = 0;
                audio.play().catch(function() {});
                tile.classList.add('shum-active');
                activeIndex = i;
            }
        });
    });
}
