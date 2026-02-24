// ===== SPIRAL / GOODNIGHT GAME =====

function renderSpiralGame() {
    // Cancel previous spiral if any
    if (_spiralToken) { _spiralToken.cancelled = true; _spiralToken = null; }
    contentArea.innerHTML = '';

    var uiLang = langMode === 'uk' ? 'uk' : langMode === 'de' ? 'de' : langMode === 'he' ? 'he' : 'ru';
    var labelsMap = {
        ru: { slower: 'Медленнее', faster: 'Быстрее',  hint: 'Смотри в центр · расслабься · דבש' },
        uk: { slower: 'Повільніше', faster: 'Швидше',   hint: 'Дивись у центр · розслабся · דבש'  },
        de: { slower: 'Langsamer',  faster: 'Schneller', hint: 'Schau in die Mitte · entspanne dich · דבש' },
        he: { slower: 'אטי יותר',   faster: 'מהיר יותר', hint: 'הסתכל למרכז · הירגע · דבש' }
    };
    var labels = labelsMap[uiLang];

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'section-title-bar';
    titleBar.innerHTML = '<h1 class="section-title">' + I18N.sectionTitle('spiral', langMode) + '</h1>';
    contentArea.appendChild(titleBar);

    // Dark canvas wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'spiral-wrapper';
    contentArea.appendChild(wrapper);

    // Hint label
    var hintLabel = document.createElement('div');
    hintLabel.className = 'spiral-label';
    hintLabel.textContent = labels.hint;
    wrapper.appendChild(hintLabel);

    // Canvas
    var canvas = document.createElement('canvas');
    canvas.className = 'spiral-canvas';
    wrapper.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    // Speed controls
    var ctrlDiv = document.createElement('div');
    ctrlDiv.className = 'spiral-controls';
    var slowerBtn = document.createElement('button');
    slowerBtn.className = 'spiral-btn';
    slowerBtn.textContent = labels.slower;
    var fasterBtn = document.createElement('button');
    fasterBtn.className = 'spiral-btn';
    fasterBtn.textContent = labels.faster;
    ctrlDiv.appendChild(slowerBtn);
    ctrlDiv.appendChild(fasterBtn);
    wrapper.appendChild(ctrlDiv);

    // --- Animation state ---
    var W, H;
    function resize() {
        W = canvas.width  = wrapper.clientWidth  || 600;
        H = canvas.height = wrapper.clientHeight || 400;
    }
    resize();

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    // 4 spiral arms
    var streams = [
        { text: 'ПРОКЛЯТ АМАН',         type: 'cursed'      },
        { text: 'БЛАГОСЛОВЕН МОРДЕХАЙ', type: 'blessed'     },
        { text: 'ברוך מרדכי',           type: 'heb_blessed' },
        { text: 'ארור המן',             type: 'heb_cursed'  }
    ];
    streams.forEach(function(s, i) {
        s.chars = i >= 2 ? s.text.split('').reverse() : s.text.split('');
    });

    var speed = 0.4;
    var t = 0;

    slowerBtn.addEventListener('click', function() { speed = Math.max(0.05, speed - 0.3); });
    fasterBtn.addEventListener('click', function() { speed = Math.min(3,    speed + 0.3); });

    function getColor(type, pulse, fade) {
        var a = fade * pulse;
        switch (type) {
            case 'cursed':      return 'rgba(' + ~~(200*pulse) + ',' + ~~(15*pulse) + ',20,' + a + ')';
            case 'blessed':     return 'rgba(255,' + ~~(200*pulse) + ',0,' + a + ')';
            case 'heb_blessed': return 'rgba(255,' + ~~(220*pulse) + ',' + ~~(60*pulse) + ',' + a + ')';
            case 'heb_cursed':  return 'rgba(' + ~~(220*pulse) + ',' + ~~(10*pulse) + ',' + ~~(50*pulse) + ',' + a + ')';
        }
    }

    var token = { cancelled: false };
    _spiralToken = token;

    // Initial dark fill
    ctx.fillStyle = '#0a0010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function draw() {
        if (token.cancelled) {
            resizeObserver.disconnect();
            return;
        }

        ctx.fillStyle = 'rgba(10,0,16,0.17)';
        ctx.fillRect(0, 0, W, H);

        var cx = W / 2;
        var cy = H / 2;
        var steps = 55;

        for (var arm = 0; arm < 4; arm++) {
            var armOffset = (arm / 4) * Math.PI * 2;
            var stream    = streams[arm];
            var isHebrew  = arm >= 2;

            for (var i = 0; i < steps; i++) {
                var ch    = stream.chars[(i + ~~(t * 2)) % stream.chars.length];
                var r     = i * 9 + 12;
                var angle = i * 0.28 + t + armOffset;
                var x     = cx + r * Math.cos(angle);
                var y     = cy + r * Math.sin(angle);

                var fade     = Math.min(1, (i / steps) * 2.2);
                var pulse    = 0.65 + 0.35 * Math.sin(t * 1.8 + i * 0.35);
                var fontSize = Math.max(9, 22 - i * 0.18);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2 + (isHebrew ? Math.PI : 0));
                ctx.font = fontSize + 'px serif';
                ctx.fillStyle = getColor(stream.type, pulse, fade);
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(ch, 0, 0);
                ctx.restore();
            }
        }

        // Pulsing centre glow
        var gp  = 0.5 + 0.5 * Math.sin(t * 0.5);
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
        grd.addColorStop(0, 'rgba(' + ~~(255*gp) + ',' + ~~(160*gp) + ',' + ~~(20*(1-gp)) + ',0.15)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fill();

        t += speed * 0.012;
        requestAnimationFrame(draw);
    }

    draw();
}
