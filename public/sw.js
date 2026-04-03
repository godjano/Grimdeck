const CACHE = 'grimdeck-v2';
const PRECACHE = ['/', '/index.html', '/decor/icon-aquila.png', '/decor/divider-gold.png', '/banner-cathedral.jpg', '/bg-main.jpg', '/tex-parchment.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // App shell: network-first for HTML, cache-first for assets
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
    );
  } else {
    // Assets: cache-first
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          if (resp.ok && resp.type === 'basic') { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
          return resp;
        });
      })
    );
  }
});
