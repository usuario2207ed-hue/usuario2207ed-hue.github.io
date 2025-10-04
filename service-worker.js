const CACHE_NAME = "site-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Instala SW e cacheia arquivos básicos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa SW e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta fetch, responde com cache ou rede
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cacheResp => {
      return (
        cacheResp ||
        fetch(event.request).then(networkResp => {
          // Cacheia apenas requisições GET válidas
          if (event.request.method === "GET" && networkResp.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResp.clone());
            });
          }
          return networkResp;
        }).catch(() => {
          // fallback offline (opcional)
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      );
    })
  );
});
