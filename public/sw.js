const CACHE_VERSION = "vestyle-v4.7";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/next.svg"
];

// 1. Installation : Mise en cache immédiate de la structure de base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// 2. Activation : Nettoyage des vieux caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== DATA_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. Stratégie de Fetch : Stale-While-Revalidate (Vitesse Max)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET, les APIs Supabase et les routes API internes
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('/auth/')
  ) {
    return;
  }

  // Stratégie pour les images (Cache First)
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => 
        cache.match(request).then(response => {
          return response || fetch(request).then(networkRes => {
            cache.put(request, networkRes.clone());
            return networkRes;
          });
        })
      )
    );
    return;
  }

  // Stratégie pour les pages et assets (Stale-While-Revalidate)
  // On sert le cache instantanément, mais on met à jour en arrière-plan
  event.respondWith(
    caches.match(request).then(cachedRes => {
      const fetchPromise = fetch(request).then(networkRes => {
        if (networkRes.ok && request.method === 'GET') {
          caches.open(STATIC_CACHE).then(cache => cache.put(request, networkRes.clone()));
        }
        return networkRes;
      }).catch(() => caches.match("/offline"));

      return cachedRes || fetchPromise;
    })
  );
});

// 4. Background Sync : Synchronisation des données quand le réseau revient
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Fonction de synchro (Logique à adapter selon tes IndexedDB)
async function syncOrders() {
  console.log('[Vestyle SW] Tentative de synchronisation en arrière-plan...');
  // Ici on appellerait une API pour envoyer les données stockées localement
}

// 5. Push Notifications (Déjà présent mais préservé)
self.addEventListener("push", (event) => {
  let data = { title: "Vestyle Pro", body: "Mise à jour." };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data = { title: "Vestyle Pro", body: event.data.text() }; }
  }
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url;
      for (const client of clientList) { if (client.url === url && "focus" in client) return client.focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});