const CACHE_NAME = "dice-decision-app-v5";
const ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./supabase-config.js", "./supabase.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll().then((clients) => clients.forEach(function (client) { client.postMessage({ type: "update" }); }))),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var cloned = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, cloned); });
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      }),
  );
});
