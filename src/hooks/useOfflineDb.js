'use client';
/**
 * VesTyle — useOfflineDb
 * Hook React pour interagir avec la base Dexie.js locale.
 * Fournit un accès complet au panier, wishlist, produits, boutiques en cache.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getCart, addToCart as dbAddToCart, updateCartItem, clearCart,
  getWishlist, toggleWishlist as dbToggleWishlist, isInWishlist,
  getProductsByStore, searchProductsOffline,
  getAllCachedStores, getStoreBySlug, saveStores, saveProducts,
  getCachedProfile, saveProfile,
  getPendingOrderCount, savePendingOrder,
  getRecentSearches, saveSearch,
  getApiCache, setApiCache,
} from '@/lib/db';

// ─── Hook panier offline ────────────────────────────────────────────────────
export function useOfflineCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const items = await getCart();
      setCart(items);
    } catch (e) {
      console.warn('[useOfflineCart] erreur lecture panier:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = useCallback(async (item) => {
    await dbAddToCart(item);
    await refresh();
  }, [refresh]);

  const updateItem = useCallback(async (id, quantity) => {
    await updateCartItem(id, quantity);
    await refresh();
  }, [refresh]);

  const emptyCart = useCallback(async () => {
    await clearCart();
    await refresh();
  }, [refresh]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, loading, cartTotal, cartCount, addToCart, updateItem, emptyCart, refresh };
}

// ─── Hook wishlist offline ──────────────────────────────────────────────────
export function useOfflineWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const items = await getWishlist();
      setWishlist(items);
    } catch (e) {
      console.warn('[useOfflineWishlist] erreur:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (productId, storeId) => {
    const added = await dbToggleWishlist(productId, storeId);
    await refresh();
    return added;
  }, [refresh]);

  const checkInWishlist = useCallback(async (productId) => {
    return isInWishlist(productId);
  }, []);

  return { wishlist, loading, toggle, checkInWishlist, count: wishlist.length, refresh };
}

// ─── Hook produits / boutiques en cache ────────────────────────────────────
export function useOfflineProducts(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) { setLoading(false); return; }
    getProductsByStore(storeId)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [storeId]);

  return { products, loading };
}

export function useOfflineStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getAllCachedStores();
      setStores(data);
    } catch { setStores([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { stores, loading, refresh };
}

export function useOfflineStore(slug) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    getStoreBySlug(slug)
      .then(setStore)
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return { store, loading };
}

// ─── Hook profil offline ───────────────────────────────────────────────────
export function useOfflineProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const p = await getCachedProfile();
      setProfile(p);
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const persistProfile = useCallback(async (profileData) => {
    await saveProfile(profileData);
    await refresh();
  }, [refresh]);

  return { profile, loading, persistProfile, refresh };
}

// ─── Hook recherche offline ────────────────────────────────────────────────
export function useOfflineSearch() {
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRecentSearches(8).then(setRecentSearches).catch(() => {});
  }, []);

  const search = useCallback(async (query) => {
    if (!query?.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const offlineResults = await searchProductsOffline(query);
      setResults(offlineResults);
      if (offlineResults.length > 0) {
        await saveSearch(query, offlineResults.map(r => r.id));
        const updated = await getRecentSearches(8);
        setRecentSearches(updated);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, recentSearches, loading, search };
}

// ─── Hook commandes en attente ─────────────────────────────────────────────
export function usePendingOrders() {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const count = await getPendingOrderCount();
      setPendingCount(count);
    } catch { setPendingCount(0); }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const addPendingOrder = useCallback(async (orderPayload) => {
    await savePendingOrder(orderPayload);
    await refresh();
    // Déclencher le background sync si disponible
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('sync-pending-orders');
      } catch (e) {
        console.warn('[usePendingOrders] Background Sync non supporté:', e);
      }
    }
  }, [refresh]);

  return { pendingCount, addPendingOrder, refresh };
}

// ─── Hook API cache (fetch avec fallback Dexie) ────────────────────────────
export function useApiWithCache(url, options = {}) {
  const { ttlMs = 3600000, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !enabled) { setLoading(false); return; }

    let cancelled = false;

    const fetchData = async () => {
      // 1. Essai depuis le cache Dexie d'abord
      try {
        const cached = await getApiCache(url);
        if (cached && !cancelled) {
          setData(cached);
          setFromCache(true);
          setLoading(false);
        }
      } catch {}

      // 2. Tentative réseau
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setFromCache(false);
          setError(null);
          await setApiCache(url, json, ttlMs);
        }
      } catch (err) {
        if (!cancelled) {
          if (!data) setError(err);
          console.warn(`[useApiWithCache] Réseau KO pour ${url}, fallback cache`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [url, enabled, ttlMs]);

  return { data, loading, fromCache, error };
}

// ─── Helpers d'hydratation (appelés par les pages pour remplir Dexie) ──────
export async function hydrateStores(storesData) {
  if (!Array.isArray(storesData) || storesData.length === 0) return;
  await saveStores(storesData);
}

export async function hydrateProducts(productsData) {
  if (!Array.isArray(productsData) || productsData.length === 0) return;
  await saveProducts(productsData);
}
