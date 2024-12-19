const cacheName = 'cache-v1';
const files = [
  '/solitaire/',
  'index.html',
  'css/style.css',
  'js/solitaire.js',
  'images/restart.svg',
  'fonts/roboto-regular.woff2',
  'fonts/roboto-bold.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
      cache.addAll(files);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      )
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});