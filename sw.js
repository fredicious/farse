/* FARSe 2026 — service worker : offline-first.
   5a2752b6 est remplacé par le SHA du commit au déploiement (voir deploy.yml) :
   chaque mise en ligne invalide donc automatiquement l'ancien cache. */
const VERSION = "farse-5a2752b6";
const TILES = "farse-tiles-v1";
const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./data/data.js",
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/leaflet.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./img/shows/mirage.jpg", "./img/shows/prelude.jpg", "./img/shows/pelat.jpg",
  "./img/shows/ceremoniale.jpg", "./img/shows/autostop.jpg", "./img/shows/wanted.jpg",
  "./img/shows/epiphytes.jpg", "./img/shows/lavertu.jpg", "./img/shows/baignoire.jpg",
  "./img/shows/anti.jpg", "./img/shows/influence.jpg", "./img/shows/commentfaire.jpg",
  "./img/shows/fondre.jpg", "./img/shows/wakeup.jpg", "./img/shows/plasticboum.jpg",
  "./img/shows/grosdebit.jpg", "./img/shows/pigments.jpg", "./img/shows/broglii.jpg",
  "./img/shows/monmonstre.jpg",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION && k !== TILES).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // updates.json : réseau d'abord (données fraîches), cache en secours
  if (url.pathname.endsWith("/updates.json")) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put("./updates.json", copy));
        return res;
      }).catch(() => caches.match("./updates.json"))
    );
    return;
  }

  // Tuiles OSM : cache d'abord, avec plafond
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    e.respondWith(
      caches.open(TILES).then(async c => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          c.put(e.request, res.clone());
          c.keys().then(keys => { if (keys.length > 400) keys.slice(0, keys.length - 400).forEach(k => c.delete(k)); });
          return res;
        } catch {
          return new Response("", { status: 503 });
        }
      })
    );
    return;
  }

  // Même origine : cache d'abord, réseau en secours (offline-first)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
        fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
          return res;
        })
      ).catch(() => caches.match("./index.html"))
    );
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow("./index.html#/updates");
  }));
});
