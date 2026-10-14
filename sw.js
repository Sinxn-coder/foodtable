const CACHE = "foodtable-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./motion.css",
  "./manifest.webmanifest",
  "./src/foodtable-app.js",
  "./src/roster.js",
  "./src/rotation.js",
  "./icons/favicon.svg",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];
const FONT_CSS = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap";
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

// Best effort: cache the font stylesheet and its font files so text looks right offline.
async function cacheFonts(cache) {
  try {
    const response = await fetch(FONT_CSS);
    const css = await response.clone().text();
    await cache.put(FONT_CSS, response);
    const files = [...css.matchAll(/url((https:[^)]+))/g)].map((match) => match[1]);
    await Promise.all(files.map((file) => fetch(file).then((font) => cache.put(file, font))));
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all([cache.addAll(ASSETS), cacheFonts(cache)])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Pages: network first so updates land, fall back to the cached shell offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  // Same-origin assets and Google Fonts: serve cached, refresh in background.
  if (url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok || response.type === "opaque") cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
