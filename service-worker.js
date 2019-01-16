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
    self.clients.matchAll().then(function (clients){
        clients.forEach(function(client){
            client.postMessage({update: true});
        });
    });
}

self.addEventListener('update', event => {
    event.detail.response.clone().text().then((cachedBody) => {
        fetch(event.detail.request)
            .then(response => {
                response.clone().text().then((networkBody) => {
                    if (networkBody !== cachedBody) {
                        caches.open(CACHE).then(cache => {
                            cache.put(event.detail.request.url, response.clone());
                        });
                        updateAvailable();
                    }
                });
            });
    });
});

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => {
                return cache.addAll(WHITELIST_CACHE);
            })
    );
});

self.addEventListener('activate', event => {
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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    self.dispatchEvent(
                        new CustomEvent('update', {
                            detail: {request: event.request, response: response}
                        })
                    );
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 404) {
                            return caches.match('pages/404.html');
                        }
                        return caches.open(CACHE)
                            .then(cache => {
                                cache.put(event.request.url, response.clone());
                                return response;
                            });
                    });
            }).catch(error => {
            console.log('Error, ', error);
            return caches.match('pages/offline.html');
        })
    );
});
