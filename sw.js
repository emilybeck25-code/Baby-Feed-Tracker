const CACHE_NAME = 'feed-tracker-v4';
const FILES_TO_CACHE = [
    './',
    './index.html'
];

// INSTALL: Cache the app shell
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                // If the cache key is old (not our new v4), delete it
                if (key !== CACHE_NAME) { 
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// FETCH: Serve from cache, fall back to network, AND update the cache
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            // 1. Return from cache if we have it
            if (response) {
                return response;
            }

            // 2. Not in cache: go to network
            return fetch(e.request).then(networkResponse => {
                // 3. Got a valid response?
                if (networkResponse && networkResponse.status === 200) {
                    
                    // 4. Clone it (can only consume a response once)
                    const responseToCache = networkResponse.clone();
                    
                    // 5. Open our v4 cache and store the new response
                    // This is how src/App.js and other files get cached!
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, responseToCache);
                    });
                }
                // 6. Return the original network response to the browser
                return networkResponse;
            });
        })
    );
});
