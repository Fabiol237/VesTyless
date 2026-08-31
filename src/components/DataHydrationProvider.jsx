'use client';
/**
 * VesTyle — DataHydrationProvider
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider invisible qui pré-charge automatiquement les données clés dans
 * Dexie.js (IndexedDB) dès que l'utilisateur est en ligne.
 *
 * FONCTIONNEMENT :
 *   1. Au montage, vérifie si online
 *   2. Hydrate Dexie avec : boutiques (20), produits (40), profil user
 *   3. Se redéclenche automatiquement à la reconnexion
 *   4. Totalement silencieux (pas d'UI)
 *
 * RÉSULTAT : L'utilisateur a accès aux données en cache immédiatement
 * lors du prochain mode hors-ligne, sans rien faire manuellement.
 */
import { useEffect, useRef, useCallback } from 'react';
import { saveStores, saveProducts, saveProfile } from '@/lib/db';

// ─── Durée minimum entre deux hydratations complètes (30 min) ───────────────
const HYDRATION_TTL_MS = 30 * 60 * 1000;
const HYDRATION_KEY = 'vestyle_last_hydration';

function shouldHydrate() {
  try {
    const last = parseInt(localStorage.getItem(HYDRATION_KEY) || '0', 10);
    return Date.now() - last > HYDRATION_TTL_MS;
  } catch {
    return true;
  }
}

function markHydrated() {
  try {
    localStorage.setItem(HYDRATION_KEY, Date.now().toString());
  } catch {}
}

export default function DataHydrationProvider({ children, user = null }) {
  const isHydrating = useRef(false);

  const hydrate = useCallback(async () => {
    // Ne pas re-hydrater si déjà en cours ou si trop récent
    if (isHydrating.current) return;
    if (!navigator.onLine) return;
    if (!shouldHydrate()) return;

    isHydrating.current = true;
    console.log('[DataHydration] 🌊 Démarrage de l\'hydratation offline...');

    try {
      // ── 1. Boutiques ──────────────────────────────────────────────────────
      const storesRes = await fetch('/api/boutiques?limit=20&status=active', {
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);

      if (storesRes?.ok) {
        const storesData = await storesRes.json().catch(() => null);
        const stores = storesData?.stores || storesData?.data || (Array.isArray(storesData) ? storesData : []);
        if (stores.length > 0) {
          await saveStores(stores);
          console.log(`[DataHydration] ✅ ${stores.length} boutiques mises en cache`);

          // ── 2. Produits de chaque boutique ──────────────────────────────
          // On limite à 5 boutiques pour ne pas surcharger
          const topStores = stores.slice(0, 5);
          const productFetches = topStores.map(store =>
            fetch(`/api/products?storeId=${store.id}&limit=8`, {
              signal: AbortSignal.timeout(6000),
            })
              .then(r => r.ok ? r.json() : null)
              .then(data => {
                const prods = data?.products || data?.data || (Array.isArray(data) ? data : []);
                return prods;
              })
              .catch(() => [])
          );

          const allProductArrays = await Promise.allSettled(productFetches);
          const allProducts = allProductArrays
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value || []);

          if (allProducts.length > 0) {
            await saveProducts(allProducts);
            console.log(`[DataHydration] ✅ ${allProducts.length} produits mis en cache`);
          }
        }
      }

      // ── 3. Produits tendance globaux ────────────────────────────────────
      const productsRes = await fetch('/api/products?limit=40&sort=popular', {
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);

      if (productsRes?.ok) {
        const productsData = await productsRes.json().catch(() => null);
        const products = productsData?.products || productsData?.data || (Array.isArray(productsData) ? productsData : []);
        if (products.length > 0) {
          await saveProducts(products);
          console.log(`[DataHydration] ✅ ${products.length} produits tendance mis en cache`);
        }
      }

      // ── 4. Profil utilisateur (si connecté) ────────────────────────────
      if (user?.id) {
        const profileRes = await fetch(`/api/profile?userId=${user.id}`, {
          signal: AbortSignal.timeout(5000),
        }).catch(() => null);

        if (profileRes?.ok) {
          const profileData = await profileRes.json().catch(() => null);
          if (profileData?.id) {
            await saveProfile(profileData);
            console.log('[DataHydration] ✅ Profil mis en cache');
          }
        }
      }

      markHydrated();
      console.log('[DataHydration] 🎉 Hydratation offline terminée !');

    } catch (err) {
      console.warn('[DataHydration] ⚠️ Hydratation partielle:', err?.message);
    } finally {
      isHydrating.current = false;
    }
  }, [user]);

  // ─── Hydratation initiale ─────────────────────────────────────────────────
  useEffect(() => {
    // Délai de 2s pour laisser l'app se charger d'abord
    const timer = setTimeout(hydrate, 2000);
    return () => clearTimeout(timer);
  }, [hydrate]);

  // ─── Re-hydratation à la reconnexion ─────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      // Délai de 1.5s pour que le réseau s'établisse
      const timer = setTimeout(hydrate, 1500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [hydrate]);

  // Ce provider n'a pas d'UI propre
  return children;
}
