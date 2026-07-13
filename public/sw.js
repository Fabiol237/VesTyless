// ╔═══════════════════════════════════════════════════════════════╗
// ║  Vestyle Service Worker v5.2 – Ultra-Performance Edition      ║
// ╚═══════════════════════════════════════════════════════════════╝

const CACHE_VERSION = "vestyle-v5.2";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;
const DATA_CACHE    = `${CACHE_VERSION}-data`;

// Fichiers du shell de l'application (chargés en cache à l'installation)
const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/next.svg",
];

// ── 1. INSTALLATION ─────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.warn("[SW] Shell cache partiel:", err))
  );
  // Prendre le contrôle immédiatement sans attendre la fermeture de l'onglet
  self.skipWaiting();
});

// ── 2. ACTIVATION ───────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  // Prend le contrôle de tous les clients ouverts sans rechargement
  self.clients.claim();
});

// ── 3. STRATÉGIE DE FETCH ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ❌ Ignorer: non-GET, Supabase, APIs internes, extensions navigateur
  if (
    request.method !== "GET" ||
    url.protocol === "chrome-extension:" ||
    url.hostname.includes("supabase.co") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  // 🖼️ Images → Cache First (ultra rapide, mise à jour silencieuse)
  if (request.destination === "image" || url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            // Refresh en arrière-plan sans bloquer
            fetch(request)
              .then((res) => { if (res.ok) cache.put(request, res); })
              .catch(() => {});
            return cached;
          }
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached || new Response("", { status: 404 }));
        })
      )
    );
    return;
  }

  // 📦 JS/CSS chunks Next.js → Cache First (immutable)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((res) => {
          if (res.ok) caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // 📄 Pages et autres ressources → Stale-While-Revalidate (vitesse + fraîcheur)
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res.ok && res.status < 400) {
            caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => cached || caches.match("/offline"));

      // Servir le cache instantanément, mettre à jour en arrière-plan
      return cached || fetchPromise;
    })
  );
});

// ── 4. BACKGROUND SYNC ──────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncPendingOrders());
  }
  if (event.tag === "sync-analytics") {
    event.waitUntil(syncAnalytics());
  }
});

async function syncPendingOrders() {
  console.log("[SW] Sync commandes en attente...");
}

async function syncAnalytics() {
  console.log("[SW] Sync analytics...");
}

// ── 5. PUSH NOTIFICATIONS ───────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "VesTyle Pro", body: "Mise à jour." };
  if (event.data) {
    try { data = event.data.json(); } catch {
      data = { title: "VesTyle Pro", body: event.data.text() };
    }
  }
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "vestyle-notif",
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || "/" },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const targetUrl = event.notification.data?.url || "/";
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── 6. MESSAGE HANDLER (communication avec la page) ─────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CACHE_URLS") {
    caches.open(STATIC_CACHE).then((c) => c.addAll(event.data.urls || []));
  }
});