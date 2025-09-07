/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

// Basic app-shell caching for offline use.
const CACHE = `flex-viewer-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => (self as any).skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE ? undefined : caches.delete(k))))).then(
      () => (self as any).clients.claim()
    )
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only cache same-origin GET requests
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // For precached assets: cache-first
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return r;
      }))
    );
    return;
  }
  // For other requests: network-first fallback to cache
  event.respondWith(
    fetch(req)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return r;
      })
      .catch(() => caches.match(req))
  );
});

