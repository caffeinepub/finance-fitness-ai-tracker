const CACHE_NAME = 'finfit-v1';

// App shell assets to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
];

// Patterns that should NEVER be cached (ICP canister calls, Internet Identity)
const BYPASS_PATTERNS = [
  /icp-api\.io/,
  /ic0\.app/,
  /internetcomputer\.org/,
  /identity\.ic0\.app/,
  /auth\.ic0\.app/,
  /raw\.ic0\.app/,
  /\?canisterId=/,
  /\/api\/v2\//,
];

function shouldBypass(url) {
  return BYPASS_PATTERNS.some(pattern => pattern.test(url));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Non-fatal: continue even if pre-caching fails
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Always bypass ICP/Internet Identity network calls
  if (shouldBypass(url)) {
    return; // Let the browser handle it normally
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML pages), use network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return cached || new Response('App is offline', { status: 503 });
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images), use cache-first
  if (
    url.includes('/assets/') ||
    url.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)(\?|$)/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network-first for everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
