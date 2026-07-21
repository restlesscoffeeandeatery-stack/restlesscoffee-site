// Restless Order — Service Worker
// Cache-first untuk app shell, network-only untuk API (order tidak boleh dilayani cache).
var CACHE = 'restless-order-v1';
var SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // API GAS & resource eksternal: selalu network (jangan pernah cache respons order/menu)
  if (e.request.method !== 'GET' || url.indexOf('script.google') !== -1 || url.indexOf('googleusercontent') !== -1) return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request);
    })
  );
});
