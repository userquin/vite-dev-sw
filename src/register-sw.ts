if (import.meta.env.DEV) {
    navigator.serviceWorker.register('/vite-sw-dev-server.js', { type: 'module' }).then(() => {
        console.log('dev service worker registered')
    }).catch(e => {
        console.error('failed to register dev service worker', e)
    })
}
