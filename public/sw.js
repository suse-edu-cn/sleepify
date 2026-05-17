const CACHE_VERSION = 'v1'
const STATIC_CACHE = `sleepify-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `sleepify-runtime-${CACHE_VERSION}`
const RUNTIME_MAX_ENTRIES = 80

const IMMUTABLE_PATH_PREFIXES = ['/_next/static/']
const STATIC_PATH_PREFIXES = ['/assets/', '/_next/image']
const STATIC_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.ico',
    '.css',
    '.js',
    '.woff2',
]

const PRECACHE_URLS = [
    '/',
    '/site.webmanifest',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE
                        )
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event

    if (request.method !== 'GET') {
        return
    }

    const url = new URL(request.url)

    if (url.origin !== self.location.origin) {
        return
    }

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request))
        return
    }

    if (isImmutableAsset(url.pathname)) {
        event.respondWith(cacheFirst(request))
        return
    }

    if (isStaticAsset(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event, request))
        return
    }

    event.respondWith(networkFirst(request))
})

async function cacheFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE)
    const cached = await cache.match(request)

    if (cached) {
        return cached
    }

    const response = await fetch(request)
    if (response && response.status === 200) {
        cache.put(request, response.clone())
        trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)
    }

    return response
}

async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE)
    try {
        const response = await fetch(request)
        if (response && response.status === 200) {
            cache.put(request, response.clone())
            trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)
        }
        return response
    } catch (error) {
        const cached = await cache.match(request)
        if (cached) {
            return cached
        }

        return caches.match('/')
    }
}

async function staleWhileRevalidate(event, request) {
    const cache = await caches.open(RUNTIME_CACHE)
    const cached = await cache.match(request)

    const networkPromise = fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                cache.put(request, response.clone())
                trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)
            }
            return response
        })
        .catch(() => null)

    event.waitUntil(networkPromise)

    if (cached) {
        return cached
    }

    const networkResponse = await networkPromise
    if (networkResponse) {
        return networkResponse
    }

    return caches.match('/')
}

function isImmutableAsset(pathname) {
    return IMMUTABLE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isStaticAsset(pathname) {
    if (STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return true
    }

    return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
}

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()

    if (keys.length <= maxEntries) {
        return
    }

    await cache.delete(keys[0])
    await trimCache(cacheName, maxEntries)
}
