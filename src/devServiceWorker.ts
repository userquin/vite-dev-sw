import {NetworkOnly, StaleWhileRevalidate} from "workbox-strategies";
import {setDefaultHandler} from "workbox-routing";

const cacheName = 'vite-sw-cache'
const version = 'v0.0.0'

const base = import.meta.env.BASE_URL || '/'

// add it again when HMR fixed on web workers:
// https://github.com/vitejs/vite/pull/6483
// if (import.meta.hot)
//     import.meta.hot.decline()
//

declare let self: ServiceWorkerGlobalScope

// TODO: we should use the base url
const exclusions: RegExp[] = [
    // to allow env changes?
    // /vite\/dist\/client\/env.(m)?js$/,
    // can we remove it?
    // /^\/@vite\/client$/,
    /^\/__inspect/,
    /^\/vite-sw-dev-server.js$/,
    /^\/vite-sw-dev-server.ts$/
]

const shouldBeExcluded = (req: Request) => {
    const path = new URL(req.url).pathname
    return exclusions.some(re => path.match(re) !== null)
};

self.addEventListener('install', event => {
    // @ts-ignore
    console.log('Installing....')
    ;(event as ExtendableEvent).waitUntil(caches.open(version + cacheName))
    self.skipWaiting()
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

const swrStrategy = new StaleWhileRevalidate({
    cacheName: version + cacheName,
});

const networkOnlyStrategy = new NetworkOnly()

const loadUrl = async (event: FetchEvent) => {
    const request = event.request;
    const url = request.url

    // @ts-ignore
    console.log('HANDLING REQUEST', url)

    if (request.method === 'GET' && !shouldBeExcluded(request)) {
        return await swrStrategy.handle({
            event,
            request: url,
        });
    }

    return await networkOnlyStrategy.handle({
        event,
        request: url,
    });
};

setDefaultHandler(({event}) => loadUrl(event as FetchEvent));

