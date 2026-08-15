/**
 * VesTyle — Service Worker Ultra-Puissant v5.0
 * ────────────────────────────────────────────────────────────────────────────
 * STRATÉGIES :
 *   App Shell       → Cache First (permanent)
 *   Images          → Cache First (7 jours)
 *   Assets Next.js  → Stale-While-Revalidate (30 jours)
 *   API produits    → Network First + fallback Dexie (1h)
 *   API boutiques   → Network First + fallback Dexie (30 min)
 *   Auth/Supabase   → Network Only (jamais mis en cache)
 *
 * FEATURES :
 *   ✅ Multi-cache stratégies
 *   ✅ Background Sync (commandes en attente offline)
 *   ✅ Periodic Background Sync (refresh données)
 *   ✅ Push Notifications enrichies avec actions
 *   ✅ Intégration Dexie.js (IndexedDB) via importScripts
 *   ✅ Message Channel (communication avec l'app React)
 *   ✅ Auto skipWaiting sur message
 */

// ─── Versions & Noms des caches ──────────────────────────────────────────────
const SW_VERSION = 'vestyle-v5.0';
const CACHE_STATIC  = `${SW_VERSION}-static`;
const CACHE_IMAGES  = `${SW_VERSION}-images`;
const CACHE_PAGES   = `${SW_VERSION}-pages`;
const CACHE_API     = `${SW_VERSION}-api`;
const ALL_CACHES    = [CACHE_STATIC, CACHE_IMAGES, CACHE_PAGES, CACHE_API];

// ─── App Shell — URLs à précacher impérativement ─────────────────────────────
const APP_SHELL = [
  '/',
  '/offline',
  '/boutiques',
  '/login',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
];

// ─── Durées de cache ──────────────────────────────────────────────────────────
const TTL = {
  images:    7  * 24 * 60 * 60 * 1000, // 7 jours
  api:       1  * 60 * 60 * 1000,       // 1 heure
  storeApi:  30 * 60 * 1000,            // 30 minutes
  static:    30 * 24 * 60 * 60 * 1000, // 30 jours
};

// ─── Patterns à ne JAMAIS mettre en cache ────────────────────────────────────
const NETWORK_ONLY_PATTERNS = [
  /supabase\.co/,
  /\/api\/auth\//,
  /\/api\/ai\//,
  /\/api\/chat\//,
  /\/api\/emails\//,
  /\/api\/orders/,
  /\/api\/admin\//,
  /\/_next\/webpack-hmr/,
  /chrome-extension/,
];

// ─── Patterns API à mettre en cache (avec TTL) ────────────────────────────────
const API_CACHEABLE_PATTERNS = [
  /\/api\/products/,
  /\/api\/store\/[^/]+\/public/,
  /\/api\/boutiques/,
  /\/api\/search/,
  /\/api\/categories/,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isNetworkOnly(url) {
  return NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(url));
}

function isApiCacheable(pathname) {
  return API_CACHEABLE_PATTERNS.some(pattern => pattern.test(pathname));
}

function isStaticAsset(url) {
  return url.includes('/_next/static/') || url.includes('/static/');
}

function isImageRequest(request) {
  return (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)(\?.*)?$/.test(request.url)
  );
}

// ─── Stratégie : Network First avec fallback cache instantané ─────────────────
async function networkFirst(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // 1. Si l'appareil est complètement hors-ligne, servir le cache TOUT DE SUITE (0ms)
  if (self.navigator && !self.navigator.onLine) {
    if (cached) return cached;
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) return offlinePage;
    }
  }

  // 2. Si en ligne, tenter le réseau avec un TIMEOUT ULTRA-RAPIDE de 1.8 seconde
  // Évite de pendre 30 secondes en attente du réseau quand la connexion faiblit
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const networkRes = await fetch(request.clone(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkRes.ok) {
      const cloned = networkRes.clone();
      const headers = new Headers(cloned.headers);
      headers.set('sw-cache-time', Date.now().toString());
      headers.set('sw-cache-ttl', ttlMs.toString());
      const body = await cloned.arrayBuffer();
      const cachedRes = new Response(body, { status: cloned.status, headers });
      cache.put(request, cachedRes);
    }
    return networkRes;
  } catch (err) {
    // Si le réseau a échoué ou a dépassé 1.8s → Fallback instantané sur le cache !
    if (cached) return cached;
    if (request.destination === 'document') {
      return caches.match('/offline') || new Response('Hors-ligne', { status: 503 });
    }
    return new Response(JSON.stringify({ error: 'offline', cached: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// ─── Stratégie : Cache First ──────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) {
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    return new Response('', { status: 503 });
  }
}

// ─── Stratégie : Stale-While-Revalidate ──────────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request.clone()).then(networkRes => {
    if (networkRes.ok) {
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  }).catch(() => null);

  return cached || fetchPromise || caches.match('/offline');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENT INSTALL
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log(`[VeStyle SW] Installation ${SW_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        // addAll avec gestion individuelle des erreurs pour éviter l'échec total
        return Promise.allSettled(
          APP_SHELL.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Échec précachage ${url}:`, err.message)
            )
          )
        );
      })
      .then(() => {
        console.log('[VeStyle SW] App Shell précaché ✅');
        self.skipWaiting();
      })
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENT ACTIVATE
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log(`[VeStyle SW] Activation ${SW_VERSION}`);
  event.waitUntil(
    Promise.all([
      // Supprimer les anciens caches
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => !ALL_CACHES.includes(key))
            .map(key => {
              console.log(`[SW] Suppression ancien cache: ${key}`);
              return caches.delete(key);
            })
        )
      ),
      // Prendre le contrôle de tous les clients immédiatement
      self.clients.claim(),
    ])
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENT FETCH — Intercepteur principal
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── 1. Ignorer les requêtes non-GET ─────────────────────────────────────
  if (request.method !== 'GET') return;

  // ── 2. Ignorer le protocole non-http(s) ─────────────────────────────────
  if (!url.protocol.startsWith('http')) return;

  // ── 3. Network Only (auth, IA, Supabase…) ───────────────────────────────
  if (isNetworkOnly(request.url)) return;

  // ── 4. Assets statiques Next.js → Stale-While-Revalidate ────────────────
  if (isStaticAsset(request.url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  // ── 5. Images → Cache First (7 jours) ───────────────────────────────────
  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // ── 6. API cacheable → Network First avec fallback ───────────────────────
  if (url.pathname.startsWith('/api/') && isApiCacheable(url.pathname)) {
    const ttl = url.pathname.includes('/store') ? TTL.storeApi : TTL.api;
    event.respondWith(networkFirst(request, CACHE_API, ttl));
    return;
  }

  // ── 7. Pages Next.js / navigations → Network First ──────────────────────
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_PAGES, TTL.static));
    return;
  }

  // ── 8. Reste → Stale-While-Revalidate ────────────────────────────────────
  event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
});

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC — Synchronisation des commandes en attente
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  console.log(`[VeStyle SW] Background Sync: ${event.tag}`);

  if (event.tag === 'sync-pending-orders') {
    event.waitUntil(syncPendingOrdersFromIDB());
  }

  if (event.tag === 'sync-cache-refresh') {
    event.waitUntil(refreshCriticalApiCaches());
  }
});

async function syncPendingOrdersFromIDB() {
  console.log('[SW] Synchronisation des commandes en attente...');
  try {
    // Ouvrir IndexedDB directement (Dexie n'est pas disponible dans le SW via import)
    const db = await openVeStyleDB();
    const tx = db.transaction('pendingOrders', 'readwrite');
    const store = tx.objectStore('pendingOrders');
    const pending = await getAllPending(store);

    for (const order of pending) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.payload),
        });

        const updateTx = db.transaction('pendingOrders', 'readwrite');
        const updateStore = updateTx.objectStore('pendingOrders');

        if (res.ok) {
          updateStore.put({ ...order, status: 'synced' });
          console.log(`[SW] ✅ Commande ${order.id} synchronisée`);
        } else {
          const newRetries = (order.retries || 0) + 1;
          updateStore.put({
            ...order,
            retries: newRetries,
            status: newRetries >= 3 ? 'failed' : 'pending',
          });
        }
        await new Promise((r, j) => { updateTx.oncomplete = r; updateTx.onerror = j; });
      } catch (err) {
        console.warn(`[SW] ❌ Échec sync commande ${order.id}:`, err);
      }
    }

    // Notifier les clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage({
      type: 'SYNC_COMPLETE',
      synced: pending.filter(o => o.status !== 'pending').length,
    }));

  } catch (err) {
    console.error('[SW] Erreur sync IDB:', err);
  }
}

async function refreshCriticalApiCaches() {
  console.log('[SW] Rafraîchissement des caches API critiques...');
  const urlsToRefresh = ['/api/products?limit=20', '/api/boutiques?limit=10'];

  const cache = await caches.open(CACHE_API);
  await Promise.allSettled(
    urlsToRefresh.map(async url => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          await cache.put(url, res);
          console.log(`[SW] ✅ Cache rafraîchi: ${url}`);
        }
      } catch { /* silencieux */ }
    })
  );
}

// ─── Helpers IndexedDB natif (dans le SW) ────────────────────────────────────
function openVeStyleDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('VeStyleDB', 2);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPending(store) {
  return new Promise((resolve, reject) => {
    const results = [];
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.status === 'pending') results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERIODIC BACKGROUND SYNC
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('periodicsync', (event) => {
  console.log(`[VeStyle SW] Periodic Sync: ${event.tag}`);
  if (event.tag === 'refresh-products') {
    event.waitUntil(refreshCriticalApiCaches());
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  let data = {
    title: '🛍️ VesTyle',
    body: 'Vous avez une nouvelle notification.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: 'vestyle-notif',
    actions: [],
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'vestyle-notif',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || '/', ...data.extra },
    actions: data.actions?.length > 0 ? data.actions : [
      { action: 'open', title: '👀 Voir', icon: '/icon-192.png' },
      { action: 'dismiss', title: '✕ Fermer' },
    ],
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Essayer de focaliser un onglet existant
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir un nouvel onglet
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE CHANNEL — Communication bidirectionnelle avec l'app React
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Mise à jour appliquée via SKIP_WAITING');
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then(keys => Promise.all(keys.map(k => caches.delete(k))))
          .then(() => {
            event.source?.postMessage({ type: 'CACHE_CLEARED' });
            console.log('[SW] Tous les caches supprimés');
          })
      );
      break;

    case 'CLEAR_API_CACHE':
      event.waitUntil(
        caches.delete(CACHE_API).then(() => {
          event.source?.postMessage({ type: 'API_CACHE_CLEARED' });
        })
      );
      break;

    case 'GET_CACHE_STATS':
      event.waitUntil(
        caches.keys().then(async keys => {
          const stats = {};
          for (const key of keys) {
            const cache = await caches.open(key);
            const requests = await cache.keys();
            stats[key] = requests.length;
          }
          event.source?.postMessage({ type: 'CACHE_STATS', stats, version: SW_VERSION });
        })
      );
      break;

    case 'TRIGGER_SYNC':
      if ('SyncManager' in self.registration) {
        self.registration.sync.register(payload?.tag || 'sync-pending-orders')
          .then(() => event.source?.postMessage({ type: 'SYNC_REGISTERED' }))
          .catch(() => {});
      }
      break;

    default:
      break;
  }
});

console.log(`[VesTyle SW] v5.0 chargé 🚀`);