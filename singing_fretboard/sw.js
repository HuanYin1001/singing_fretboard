// Singing Fretboard — service worker
// 換版本號就會讓所有裝置重新下載新檔案
const VERSION = 'sf-v16';
const CORE = [
  './',
  './index.html',
  './chord.html',
  './manifest.webmanifest',
  './fretboard-music.js',
  './fretboard-storage.js',
  './project-link.js',
  './chord-music.js',
  './chord-library.js',
  './tour-text.js',
  './assets/tour-avatar.jpg',
  './assets/huanyin_logo.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com|jsdelivr\.net/.test(url.host);
  if (!sameOrigin && !isFont) return;

  // 導覽請求：先網路、失敗回快取（離線時用上次的頁面）
  if (req.mode === 'navigate') {
    const page = /chord\.html$/.test(url.pathname) ? './chord.html' : './index.html';
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(page, copy));
          return res;
        })
        .catch(() => caches.match(page).then((r) => r || caches.match('./')))
    );
    return;
  }

  // 其他資源：先快取、再網路
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
