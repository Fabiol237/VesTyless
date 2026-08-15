/**
 * VesTyle — Base de données locale avec Dexie.js (IndexedDB wrapper)
 * Permet une expérience offline complète : produits, boutiques, panier, wishlist.
 * Utilisé par les hooks useOfflineDb et useOfflineSync.
 */
import Dexie from 'dexie';

// ─── Schéma de la base ───────────────────────────────────────────────────────
const db = new Dexie('VeStyleDB');

db.version(2).stores({
  // Produits mis en cache depuis l'API
  products:      '&id, storeId, name, category, updatedAt',
  // Boutiques mises en cache
  stores:        '&id, slug, name, ownerId, updatedAt',
  // Panier local (survivre à la déconnexion)
  cart:          '++id, productId, storeId, quantity, price, addedAt',
  // Wishlist locale
  wishlist:      '++id, productId, storeId, addedAt',
  // Profil utilisateur courant
  profile:       '&id, email, fullName, avatarUrl, updatedAt',
  // Commandes passées offline → synchronisées dès que le réseau revient
  pendingOrders: '++id, storeId, status, payload, createdAt, retries',
  // Cache des recherches récentes (résultats + query)
  searches:      '++id, query, results, createdAt',
  // API cache générique (clé = URL de la requête)
  apiCache:      '&cacheKey, data, fetchedAt, expiresAt',
});

// ─── Helpers génériques ──────────────────────────────────────────────────────

/** Met en cache une réponse d'API avec TTL (en ms) */
export async function setApiCache(cacheKey, data, ttlMs = 3600000) {
  const now = Date.now();
  await db.apiCache.put({
    cacheKey,
    data,
    fetchedAt: now,
    expiresAt: now + ttlMs,
  });
}

/** Lit le cache d'une API, retourne null si expiré ou absent */
export async function getApiCache(cacheKey) {
  try {
    const entry = await db.apiCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await db.apiCache.delete(cacheKey);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/** Invalide tous les caches expirés */
export async function purgeExpiredCache() {
  const now = Date.now();
  await db.apiCache.where('expiresAt').below(now).delete();
}

// ─── Panier ──────────────────────────────────────────────────────────────────

export async function getCart() {
  return db.cart.toArray();
}

export async function addToCart(item) {
  // Si le produit est déjà là, on augmente la quantité
  const existing = await db.cart.where('productId').equals(item.productId).first();
  if (existing) {
    return db.cart.update(existing.id, { quantity: existing.quantity + (item.quantity || 1) });
  }
  return db.cart.add({ ...item, quantity: item.quantity || 1, addedAt: Date.now() });
}

export async function updateCartItem(id, quantity) {
  if (quantity <= 0) return db.cart.delete(id);
  return db.cart.update(id, { quantity });
}

export async function clearCart() {
  return db.cart.clear();
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export async function getWishlist() {
  return db.wishlist.toArray();
}

export async function toggleWishlist(productId, storeId) {
  const existing = await db.wishlist.where('productId').equals(productId).first();
  if (existing) {
    await db.wishlist.delete(existing.id);
    return false; // removed
  }
  await db.wishlist.add({ productId, storeId, addedAt: Date.now() });
  return true; // added
}

export async function isInWishlist(productId) {
  const item = await db.wishlist.where('productId').equals(productId).first();
  return !!item;
}

// ─── Produits ────────────────────────────────────────────────────────────────

export async function saveProducts(products) {
  await db.products.bulkPut(products.map(p => ({ ...p, updatedAt: Date.now() })));
}

export async function getProductsByStore(storeId) {
  return db.products.where('storeId').equals(storeId).toArray();
}

export async function searchProductsOffline(query) {
  const q = query.toLowerCase();
  return db.products.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  ).toArray();
}

// ─── Boutiques ───────────────────────────────────────────────────────────────

export async function saveStores(stores) {
  await db.stores.bulkPut(stores.map(s => ({ ...s, updatedAt: Date.now() })));
}

export async function getStoreBySlug(slug) {
  return db.stores.where('slug').equals(slug).first();
}

export async function getAllCachedStores() {
  return db.stores.toArray();
}

// ─── Commandes en attente (offline) ──────────────────────────────────────────

export async function savePendingOrder(orderPayload) {
  return db.pendingOrders.add({
    storeId: orderPayload.storeId,
    status: 'pending',
    payload: orderPayload,
    createdAt: Date.now(),
    retries: 0,
  });
}

export async function getPendingOrders() {
  return db.pendingOrders.where('status').equals('pending').toArray();
}

export async function markOrderSynced(id) {
  return db.pendingOrders.update(id, { status: 'synced' });
}

export async function markOrderFailed(id) {
  const order = await db.pendingOrders.get(id);
  if (!order) return;
  if (order.retries >= 3) {
    return db.pendingOrders.update(id, { status: 'failed' });
  }
  return db.pendingOrders.update(id, { retries: order.retries + 1 });
}

export async function getPendingOrderCount() {
  return db.pendingOrders.where('status').equals('pending').count();
}

// ─── Profil ──────────────────────────────────────────────────────────────────

export async function saveProfile(profile) {
  return db.profile.put({ ...profile, updatedAt: Date.now() });
}

export async function getCachedProfile() {
  return db.profile.toArray().then(arr => arr[0] || null);
}

// ─── Recherches ──────────────────────────────────────────────────────────────

export async function saveSearch(query, results) {
  // Garder seulement les 20 dernières recherches
  const count = await db.searches.count();
  if (count >= 20) {
    const oldest = await db.searches.orderBy('createdAt').first();
    if (oldest) await db.searches.delete(oldest.id);
  }
  return db.searches.add({ query, results, createdAt: Date.now() });
}

export async function getRecentSearches(limit = 5) {
  return db.searches.orderBy('createdAt').reverse().limit(limit).toArray();
}

export default db;
