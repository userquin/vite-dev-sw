const cacheName = 'vite-sw-cache'
const version = 'v0.0.0'

const base = import.meta.env.BASE_URL || '/'

// @ts-ignore
declare let self: ServiceWorkerGlobalScope

// TODO: we should use the base
const exclusions: RegExp[] = [/^\/@vite\/client$/, /^\/__inspect/, /^\/vite-sw-dev-server.js$/, /^\/vite-sw-dev-server.ts$/]

const shouldBeExcluded = (req: Request) => {
    const path = new URL(req.url, location.origin).pathname
    return exclusions.some(re => path.match(re) !== null)
};

self.addEventListener('install', event => {
    // @ts-ignore
    console.log('Installing....')
    ;(event as ExtendableEvent).waitUntil(caches.open(version + cacheName))
});

self.addEventListener('activate', event => {
    // @ts-ignore
    console.log('clearing old caches...')
    ;(event as ExtendableEvent).waitUntil(
        caches.keys().then(keys => {
            // Remove caches whose name is no longer valid
            return Promise.all(
                keys
                    .filter(key => {
                        return key.indexOf(version) !== 0
                    })
                    .map(key => {
                        return caches.delete(key)
                    })
            )
        })
    );
});

self.addEventListener('fetch', event => {
    const fe = event as FetchEvent
    const request = fe.request

    // @ts-ignore
    console.log('HANDLING REQUEST', request.url)

    if (request.method === 'GET' && !shouldBeExcluded(request)) {
        // @ts-ignore
        console.log('fetching with cache:', request.url)
        fe.respondWith(getCached(request))
        return
    }

    return fe.respondWith(fetch(request))
});

const getCached = async (req: Request): Promise<Response> => {
    const cache = await caches.open(version + cacheName)

    const match = await cache.match(req)

    if (match) {
        return match
    }

    const resp = await fetch(req)

    await cache.put(req, resp)

    return resp
};

addEventListener('message', event => {
    if (event.data && event.data === 'SKIP_WAITING') {
        // noinspection JSIgnoredPromiseFromCall
        self.skipWaiting()
    }
});
