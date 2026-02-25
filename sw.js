const CACHE_NAME = 'mypurim-v6';

// Static assets to cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/hangman.js',
  '/i18n.js',
  '/styles.css',
  '/tracks.json',
  '/favicon.svg',
  '/Favicon/site.webmanifest',
  '/Favicon/apple-touch-icon.png',
  '/Favicon/web-app-manifest-192x192.png',
  '/Favicon/web-app-manifest-512x512.png',
  // Modules
  '/modules/alcohol.js',
  '/modules/config.js',
  '/modules/dreidel.js',
  '/modules/esther-scroll.js',
  '/modules/halacha.js',
  '/modules/home.js',
  '/modules/maharash-scroll.js',
  '/modules/music-player.js',
  '/modules/nav.js',
  '/modules/section-core.js',
  '/modules/section-loader.js',
  '/modules/shum.js',
  '/modules/spiral.js',
  '/modules/storage.js',
  '/modules/tzedaka.js',
  '/modules/megilla-listen.js',
  '/modules/megilla-shop.js',
  '/modules/logger.js',
  // MegillaShop data
  '/MegillaShop/megilla-shop-ru.json',
  '/MegillaShop/megilla-shop-uk.json',
  '/MegillaShop/megilla-shop-de.json',
  '/MegillaShop/megilla-shop-he.json',
  // Section data (Russian, default)
  '/sections/intro.json',
  '/sections/section_a.json',
  '/sections/section_b.json',
  '/sections/section_c.json',
  // Translations
  '/translations/de/intro.json',
  '/translations/de/section_a.json',
  '/translations/de/section_b.json',
  '/translations/de/section_c.json',
  '/translations/uk/intro.json',
  '/translations/uk/section_a.json',
  '/translations/uk/section_b.json',
  '/translations/uk/section_c.json',
  '/translations/he/intro.json',
  // Halacha data
  '/Halacha/halacha-de.json',
  '/Halacha/halacha-he.json',
  '/Halacha/halacha-ru.json',
  '/Halacha/halacha-uk.json',
  // Esther scroll data
  '/pdfs/ester-de.json',
  '/pdfs/ester-ru.json',
  '/pdfs/ester-uk.json',
  '/pdfs/esther-he.json',
  // Audio (fetched lazily via network-first; no need to pre-cache the large MP3)
  // '/audio/addelojoda.mp3',
];

// Install: precache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately without waiting for old SW to be unregistered
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for everything else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests and GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (e.g. Google Fonts)
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // Large media files: network-first with cache fallback
  const isLargeMedia =
    url.pathname.match(/\.(pdf|mp3|wav|jpg|jpeg|png)$/i) &&
    !url.pathname.includes('/Favicon/');

  if (isLargeMedia) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Everything else: cache-first with network fallback
  event.respondWith(cacheFirstWithNetwork(request));
});

async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Return a basic offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cached = await caches.match('/index.html');
      if (cached) return cached;
    }
    return new Response('Офлайн. Нет соединения.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response('Офлайн. Файл недоступен.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
