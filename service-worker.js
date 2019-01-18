const CACHE = `easy_pwa`;
const WHITELIST_CACHE = [
    `/`,
    `/manifest.json`,
    `/index.html`,
    `/images/icon_48x48.png`,
    `/images/icon_72x72.png`,
    `/images/icon_96x96.png`,
    `/images/icon_144x144.png`,
    `/images/icon_192x192.png`,
    `/images/icon_512x512.png`,
    `/scripts/pwa.js`,
    `/scripts/pwacompat.js`
];

function updateAvailable() {
    self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
            client.postMessage({update: true});
        });
    });
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => {
                return cache.addAll(WHITELIST_CACHE);
            })
    );
});

self.addEventListener('activate', function (event) {
    const cacheWhitelist = [CACHE];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        updateCache(event, response.clone());
                        return response;
                    }

                    caches.open(CACHE).then(function (cache) {
                        cache.add(event.request.url);
                    });
                    return fetch(event.request);
                }
            )
    );
});

function updateCache(event, cachedResponse) {
    caches.open(CACHE).then(function (cache) {
        cache.delete(event.request.url).then(function () {
            cache.add(event.request.url).then(function () {
                cachedResponse.text().then(function (cachedBody) {
                    caches.match(event.request).then(function (response) {
                        response.text().then(function (liveBody) {
                            if (liveBody !== cachedBody) {
                                updateAvailable();
                            }
                        });
                    });
                });
            });
        });
    });
}
