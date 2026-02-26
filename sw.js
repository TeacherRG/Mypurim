// ===== SERVICE WORKER =====
// Caches static assets for offline use and faster repeat visits.
// Cache-First for HTML/CSS/JS/JSON/images; Network-First for audio/PDFs.

'use strict';

var CACHE_VERSION = 'mypurim-v2';

// Static assets to precache on install
var PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/i18n.js',
    '/hangman.js',
    '/tracks.json',
    '/favicon.svg',
    '/Favicon/site.webmanifest',
    '/Favicon/apple-touch-icon.png',
    '/Favicon/web-app-manifest-192x192.png',
    '/Favicon/web-app-manifest-512x512.png',
    '/modules/logger.js',
    '/modules/config.js',
    '/modules/storage.js',
    '/modules/music-player.js',
    '/modules/nav.js',
    '/modules/section-core.js',
    '/modules/section-loader.js',
    '/modules/esther-scroll.js',
    '/modules/hebrew-speech.js',
    '/modules/megilla-listen.js',
    '/modules/maharash-scroll.js',
    '/modules/halacha.js',
    '/modules/megilla-shop.js',
    '/modules/tzedaka.js',
    '/modules/dreidel.js',
    '/modules/alcohol.js',
    '/modules/spiral.js',
    '/modules/shum.js',
    '/modules/home.js',
    '/sections/intro.json',
    '/sections/section_a.json',
    '/sections/section_b.json',
    '/sections/section_c.json',
    '/translations/uk/intro.json',
    '/translations/uk/section_a.json',
    '/translations/uk/section_b.json',
    '/translations/uk/section_c.json',
    '/translations/de/intro.json',
    '/translations/de/section_a.json',
    '/translations/de/section_b.json',
    '/translations/de/section_c.json',
    '/translations/he/intro.json',
    '/Halacha/halacha-ru.json',
    '/Halacha/halacha-uk.json',
    '/Halacha/halacha-de.json',
    '/Halacha/halacha-en.json'
];

// ── Install: precache static shell ──────────────────────────────────────────

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(function (cache) {
            // Cache each asset individually so one failure doesn't abort the whole install
            return Promise.all(
                PRECACHE_ASSETS.map(function (url) {
                    return cache.add(url).catch(function (err) {
                        console.warn('[SW] precache miss: ' + url, err);
                    });
                })
            );
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

// ── Activate: remove stale caches ───────────────────────────────────────────

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_VERSION; })
                    .map(function (k) { return caches.delete(k); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

// ── Fetch: route requests ────────────────────────────────────────────────────

self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    // Only handle same-origin GET requests
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    var path = url.pathname;

    // Network-First for audio and PDFs (large/frequently-updated files)
    if (/\.(mp3|pdf)$/i.test(path)) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Cache-First for everything else
    event.respondWith(cacheFirst(event.request));
});

// ── Strategies ───────────────────────────────────────────────────────────────

function cacheFirst(request) {
    return caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetchAndCache(request);
    });
}

function networkFirst(request) {
    return fetch(request).then(function (response) {
        if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
                cache.put(request, clone);
            });
        }
        return response;
    }).catch(function () {
        return caches.match(request);
    });
}

function fetchAndCache(request) {
    return fetch(request).then(function (response) {
        if (!response || !response.ok) return response;
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, clone);
        });
        return response;
    }).catch(function () {
        return caches.match(request);
    });
}
