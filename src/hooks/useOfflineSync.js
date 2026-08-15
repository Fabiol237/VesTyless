'use client';
/**
 * VesTyle — useOfflineSync
 * Hook React pour gérer l'état réseau, détecter les transitions online/offline,
 * et déclencher la synchronisation des données en attente.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPendingOrders, markOrderSynced, markOrderFailed, getPendingOrderCount } from '@/lib/db';

// ─── État réseau global (singleton pour éviter les doublons d'event listeners)
let networkListeners = new Set();
let isOnlineGlobal = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnlineGlobal = true;
    networkListeners.forEach(fn => fn(true));
  });
  window.addEventListener('offline', () => {
    isOnlineGlobal = false;
    networkListeners.forEach(fn => fn(false));
  });
}

// ─── Hook principal ────────────────────────────────────────────────────────
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(isOnlineGlobal);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [justReconnected, setJustReconnected] = useState(false);
  const syncTimeoutRef = useRef(null);

  // ─── Rafraîchir le compte de commandes en attente
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOrderCount();
      setPendingCount(count);
    } catch { setPendingCount(0); }
  }, []);

  // ─── Synchroniser les commandes en attente
  const syncPendingOrders = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const pending = await getPendingOrders();
      if (pending.length === 0) {
        setIsSyncing(false);
        return;
      }

      await Promise.allSettled(
        pending.map(async (order) => {
          try {
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(order.payload),
            });
            if (res.ok) {
              await markOrderSynced(order.id);
            } else {
              await markOrderFailed(order.id);
            }
          } catch {
            await markOrderFailed(order.id);
          }
        })
      );

      setLastSyncAt(new Date());
      await refreshPendingCount();
    } catch (err) {
      console.error('[useOfflineSync] Erreur sync:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  // ─── Gérer les changements de connectivité
  useEffect(() => {
    const handleNetworkChange = (online) => {
      setIsOnline(online);
      if (online) {
        // Signal de reconnexion → feedback visuel
        setJustReconnected(true);
        // Déclencher la synchro avec un petit délai pour laisser le réseau s'établir
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          syncPendingOrders();
          // Masquer le badge "reconnecté" après 4 secondes
          setTimeout(() => setJustReconnected(false), 4000);
        }, 1500);
      }
    };

    networkListeners.add(handleNetworkChange);
    return () => {
      networkListeners.delete(handleNetworkChange);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [syncPendingOrders]);

  // ─── Polling du nombre de commandes en attente
  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 15000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  // ─── Exposer le SW Background Sync si disponible
  const requestBackgroundSync = useCallback(async (tag = 'sync-pending-orders') => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register(tag);
      return true;
    } catch (e) {
      console.warn('[useOfflineSync] Background Sync indisponible:', e);
      return false;
    }
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingCount,
    isSyncing,
    lastSyncAt,
    justReconnected,
    syncNow: syncPendingOrders,
    requestBackgroundSync,
    refreshPendingCount,
  };
}

// ─── Hook simplifié pour juste connaître l'état réseau ─────────────────────
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(isOnlineGlobal);

  useEffect(() => {
    const handler = (online) => setIsOnline(online);
    networkListeners.add(handler);
    return () => networkListeners.delete(handler);
  }, []);

  return isOnline;
}

// ─── Hook pour enregistrer le SW au montage ─────────────────────────────────
export function useServiceWorkerRegistration() {
  const [swState, setSwState] = useState('idle'); // idle | registering | active | error
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwState('unsupported');
      return;
    }

    const registerSW = async () => {
      setSwState('registering');
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setSwState('active');

        // Vérifier si une mise à jour est disponible
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Un nouveau SW est installé, informer l'utilisateur
              setUpdateAvailable(true);
            }
          });
        });

        // Vérifier les mises à jour toutes les 30 minutes
        setInterval(() => reg.update(), 30 * 60 * 1000);

      } catch (err) {
        console.error('[SW] Erreur d\'enregistrement:', err);
        setSwState('error');
      }
    };

    registerSW();
  }, []);

  const applyUpdate = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, []);

  return { swState, updateAvailable, applyUpdate };
}
