// Bump this version whenever you deploy a new build to force cache refresh
const CACHE_NAME = 'finfit-v4';

// App shell assets to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/assets/generated/icon-192.dim_192x192.png',
  '/assets/generated/icon-512.dim_512x512.png',
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
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Pre-cache the app shell; ignore individual failures
        return Promise.allSettled(
          APP_SHELL.map(url =>
            cache.add(url).catch(() => { /* non-fatal */ })
          )
        );
      })
      .then(() => self.skipWaiting()) // Take over immediately, don't wait for old SW to die
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim()) // Take control of all open clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Always bypass ICP/Internet Identity network calls — never cache these
  if (shouldBypass(url)) {
    return; // Let the browser handle it normally
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML pages), use network-first with cache fallback
  // This ensures home screen launches always get the freshest shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed — serve cached index.html as SPA fallback
          return caches.match('/index.html')
            .then((cached) => {
              if (cached) return cached;
              // Last resort: try matching the request itself
              return caches.match(request);
            })
            .then((cached) => {
              if (cached) return cached;
              // Nothing cached — return a minimal offline page
              return new Response(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>FinFit</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8f7f4;flex-direction:column;gap:16px}p{margin:0;color:#333}p.sub{color:#888;font-size:14px}</style></head><body><p style="font-size:20px;font-weight:700">FinFit</p><p class="sub">Please check your connection and try again.</p></body></html>',
                { status: 200, headers: { 'Content-Type': 'text/html' } }
              );
            });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images), use cache-first for performance
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
        }).catch(() => {
          // Asset not available offline — return empty response to avoid hanging
          return new Response('', { status: 408 });
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
