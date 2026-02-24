// ===== MAHARASH SCROLL VIEWER =====

function renderMaharashScroll() {
    contentArea.innerHTML = '';

    const IMAGES = Array.from({ length: 11 }, function (_, i) {
        return 'pdfs/Maharash/Megila' + (i + 1) + '.jpg';
    });

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = I18N.sectionTitle('maharash_scroll', langMode);
    contentArea.appendChild(h2);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'maharash-toolbar';

    const pageCounter = document.createElement('span');
    pageCounter.className = 'maharash-page-counter';
    pageCounter.textContent = '1 / 11';
    toolbar.appendChild(pageCounter);

    const zoomOut = document.createElement('button');
    zoomOut.className = 'maharash-zoom-btn';
    zoomOut.textContent = '−';
    zoomOut.title = 'Уменьшить / Zoom out';

    const zoomIn = document.createElement('button');
    zoomIn.className = 'maharash-zoom-btn';
    zoomIn.textContent = '+';
    zoomIn.title = 'Увеличить / Zoom in';

    toolbar.appendChild(zoomOut);
    toolbar.appendChild(zoomIn);

    const fsBtn = document.createElement('button');
    fsBtn.className = 'maharash-fs-btn';
    fsBtn.title = 'Полный экран / Fullscreen';
    fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    toolbar.appendChild(fsBtn);

    contentArea.appendChild(toolbar);

    // Scroll container
    const viewer = document.createElement('div');
    viewer.className = 'maharash-viewer';
    contentArea.appendChild(viewer);

    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'maharash-nav maharash-nav-prev';
    prevBtn.innerHTML = '&#8249;';
    prevBtn.title = 'Предыдущая страница';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'maharash-nav maharash-nav-next';
    nextBtn.innerHTML = '&#8250;';
    nextBtn.title = 'Следующая страница';

    viewer.appendChild(prevBtn);

    // Image strip
    const strip = document.createElement('div');
    strip.className = 'maharash-strip';
    viewer.appendChild(strip);

    viewer.appendChild(nextBtn);

    // Floating zoom overlay for fullscreen mode
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'maharash-zoom-overlay';

    const zoomOutFs = document.createElement('button');
    zoomOutFs.className = 'maharash-zoom-fs-btn';
    zoomOutFs.textContent = '−';
    zoomOutFs.title = 'Уменьшить / Zoom out';

    const zoomInFs = document.createElement('button');
    zoomInFs.className = 'maharash-zoom-fs-btn';
    zoomInFs.textContent = '+';
    zoomInFs.title = 'Увеличить / Zoom in';

    zoomOverlay.appendChild(zoomInFs);
    zoomOverlay.appendChild(zoomOutFs);
    viewer.appendChild(zoomOverlay);

    IMAGES.forEach(function (src, idx) {
        const slide = document.createElement('div');
        slide.className = 'maharash-slide';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Мегила Махараш, страница ' + (idx + 1);
        img.className = 'maharash-img';
        img.loading = idx === 0 ? 'eager' : 'lazy';

        slide.appendChild(img);
        strip.appendChild(slide);
    });

    // State
    let currentPage = 0;
    let zoomLevel = 1;
    let panY = 0;

    function applyZoom() {
        const imgs = strip.querySelectorAll('.maharash-img');
        for (var z = 0; z < imgs.length; z++) {
            imgs[z].style.transform = '';
            imgs[z].style.transformOrigin = '';
        }
        if (imgs[currentPage]) {
            var parts = [];
            if (panY !== 0) parts.push('translateY(' + panY + 'px)');
            if (zoomLevel !== 1) parts.push('scale(' + zoomLevel + ')');
            if (parts.length) {
                imgs[currentPage].style.transform = parts.join(' ');
                imgs[currentPage].style.transformOrigin = 'center center';
            }
        }
        zoomIn.disabled = zoomLevel >= 4;
        zoomOut.disabled = zoomLevel <= 0.5;
        zoomInFs.disabled = zoomLevel >= 4;
        zoomOutFs.disabled = zoomLevel <= 0.5;
    }

    zoomOut.addEventListener('click', function () {
        zoomLevel = Math.max(0.5, +(zoomLevel - 0.5).toFixed(1));
        if (zoomLevel === 1) panY = 0;
        applyZoom();
    });
    zoomIn.addEventListener('click', function () {
        zoomLevel = Math.min(4, +(zoomLevel + 0.5).toFixed(1));
        applyZoom();
    });

    zoomOutFs.addEventListener('click', function () {
        zoomLevel = Math.max(0.5, +(zoomLevel - 0.5).toFixed(1));
        if (zoomLevel === 1) panY = 0;
        applyZoom();
    });
    zoomInFs.addEventListener('click', function () {
        zoomLevel = Math.min(4, +(zoomLevel + 0.5).toFixed(1));
        applyZoom();
    });

    function goTo(idx) {
        currentPage = Math.max(0, Math.min(IMAGES.length - 1, idx));
        strip.style.transform = 'translateX(-' + (currentPage * 100) + '%)';
        pageCounter.textContent = (currentPage + 1) + ' / ' + IMAGES.length;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === IMAGES.length - 1;
        zoomLevel = 1;
        panY = 0;
        applyZoom();
    }

    goTo(0);

    prevBtn.addEventListener('click', function () { goTo(currentPage - 1); });
    nextBtn.addEventListener('click', function () { goTo(currentPage + 1); });

    // Keyboard navigation
    function onKey(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { goTo(currentPage + 1); e.preventDefault(); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { goTo(currentPage - 1); e.preventDefault(); }
        if (e.key === '+' || e.key === '=') { zoomLevel = Math.min(4, +(zoomLevel + 0.5).toFixed(1)); applyZoom(); e.preventDefault(); }
        if (e.key === '-') { zoomLevel = Math.max(0.5, +(zoomLevel - 0.5).toFixed(1)); applyZoom(); e.preventDefault(); }
        if (e.key === 'Escape' && document.fullscreenElement) { document.exitFullscreen(); }
    }
    document.addEventListener('keydown', onKey);

    // Touch/swipe and pinch-to-zoom support
    var touchStartX = null;
    var touchStartY = null;
    var panYAtTouchStart = 0;
    var pinchStartDist = null;
    var pinchStartZoom = 1;
    var isPanning = false;

    strip.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
            var dx = e.touches[1].clientX - e.touches[0].clientX;
            var dy = e.touches[1].clientY - e.touches[0].clientY;
            pinchStartDist = Math.sqrt(dx * dx + dy * dy);
            pinchStartZoom = zoomLevel;
            touchStartX = null;
            touchStartY = null;
            isPanning = false;
        } else {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            panYAtTouchStart = panY;
            pinchStartDist = null;
            isPanning = false;
        }
    }, { passive: true });

    strip.addEventListener('touchmove', function (e) {
        if (e.touches.length === 2 && pinchStartDist !== null) {
            // Pinch-to-zoom
            var dx = e.touches[1].clientX - e.touches[0].clientX;
            var dy = e.touches[1].clientY - e.touches[0].clientY;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var scale = dist / pinchStartDist;
            zoomLevel = Math.max(0.5, Math.min(4, +(pinchStartZoom * scale).toFixed(1)));
            applyZoom();
        } else if (e.touches.length === 1 && zoomLevel > 1 && touchStartY !== null) {
            // Vertical pan when zoomed in
            var panDelta = e.touches[0].clientY - touchStartY;
            var imgs = strip.querySelectorAll('.maharash-img');
            var maxPan = imgs[currentPage] ? imgs[currentPage].offsetHeight * (zoomLevel - 1) / 2 : 0;
            panY = Math.max(-maxPan, Math.min(maxPan, panYAtTouchStart + panDelta));
            isPanning = true;
            applyZoom();
            e.preventDefault();
        }
    }, { passive: false });

    strip.addEventListener('touchend', function (e) {
        if (e.touches.length === 0) {
            if (!isPanning && pinchStartDist === null && touchStartX !== null) {
                // Horizontal swipe: navigate pages
                var dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) { goTo(currentPage + (dx < 0 ? 1 : -1)); }
            }
            touchStartX = null;
            touchStartY = null;
            pinchStartDist = null;
            isPanning = false;
        }
    }, { passive: true });

    // Fullscreen
    fsBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            viewer.requestFullscreen().catch(function () {});
        } else {
            document.exitFullscreen();
        }
    });

    function onFsChange() {
        if (document.fullscreenElement === viewer) {
            fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
            viewer.classList.add('maharash-fullscreen-active');
        } else {
            fsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
            viewer.classList.remove('maharash-fullscreen-active');
        }
    }
    document.addEventListener('fullscreenchange', onFsChange);

    // Cleanup keyboard and fullscreen listeners when section changes
    var cleanupOnce = function () {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('fullscreenchange', onFsChange);
    };
    contentArea.addEventListener('maharash-cleanup', cleanupOnce, { once: true });
}
