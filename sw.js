const CACHE_NAME = 'knk-v20';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/data.json',
  '/chapter/',
  '/chapter/index.html',
  '/chapter/reader.css',
  '/chapter/reader.js',
  '/prologue/',
  '/prologue/index.html',
  '/prologue/logs.txt',
  '/techniques/',
  '/techniques/index.html',
  '/techniques/techniques.txt'
];

// install cache thing
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// handle old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// offline support
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});