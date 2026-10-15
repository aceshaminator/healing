// Healing service worker: keeps the whole app on the phone so it opens with no signal.
// The build fills in the two placeholders below with the real file list and a version number.
const VERSION = '__VERSION__';
const CACHE = 'healing-' + VERSION;

let PRECACHE = [];
try {
  PRECACHE = JSON.parse('__PRECACHE__');
} catch (e) {
  PRECACHE = [];
}

// All files are saved together. If any file cannot be saved, nothing is installed
// and the app keeps working online as normal. It tries again on the next visit.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// Remove saved copies from older versions of the app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('healing-') && k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Live data such as the news list always goes to the network. The app keeps its own saved copy.
  if (url.pathname.startsWith('/api/')) return;

  // Opening the app: serve the saved copy straight away, which is fast even on a weak connection.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches
        .match('/index.html')
        .then((cached) => cached || caches.match('/'))
        .then((cached) => cached || fetch(req)),
    );
    return;
  }

  // Everything else: saved copy first, network if it is missing (and then save it).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    }),
  );
});