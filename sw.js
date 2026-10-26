const CACHE_NAME = 'knk-v26';
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
    '/techniques/techniques.txt',
    '/src/knkbanner.png',
    '/src/knklogodark0001.png',
    '/src/knklogodark0002.png',
    '/src/favicon.ico',
    '/src/arc1cover.png'
];

// 1. FORCE UPDATE: Skip the waiting phase
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

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
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    if (e.request.headers.get('accept').includes('text/html')) {
        e.respondWith(
            fetch(e.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(e.request);
                })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then((response) => {
            if (response) return response;

            return fetch(e.request).then((networkResponse) => {
                if (e.request.destination === 'image') {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            });
        })
    );
});