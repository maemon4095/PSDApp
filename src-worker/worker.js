const CACHE_NAME = `PSDApp-v0.0.0`;

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll([
            '.',
            './src/index.js',
            './src/index.css',
            './public/icon.svg',
            './manifest.webmanifest'
        ]);
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const fetchResponse = await fetch(event.request);
                await cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            } catch (e) {
                console.log("worker fetch error:", e);
                return Response.error()
            }
        }
    })());
});