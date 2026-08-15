'use client';
/**
 * VesTyle — useSWMessage
 * Hook pour envoyer des messages au Service Worker et recevoir ses réponses.
 * Permet de contrôler le SW depuis n'importe quel composant React.
 */
import { useCallback, useEffect, useState } from 'react';

// ─── Hook principal ────────────────────────────────────────────────────────
export function useSWMessage() {
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(() => setSwReady(true));
  }, []);

  /** Envoie un message au SW et attend optionnellement une réponse */
  const sendMessage = useCallback(async (type, payload = {}) => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (!reg.active) return null;
      reg.active.postMessage({ type, payload });
      return true;
    } catch (err) {
      console.warn('[useSWMessage] Erreur envoi message:', err);
      return null;
    }
  }, []);

  return { swReady, sendMessage };
}

// ─── Hook pour les statistiques du cache ──────────────────────────────────
export function useCacheStats() {
  const [stats, setStats] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendMessage } = useSWMessage();

  const fetchStats = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    setLoading(true);

    const messageHandler = (event) => {
      if (event.data?.type === 'CACHE_STATS') {
        setStats(event.data.stats);
        setVersion(event.data.version);
        setLoading(false);
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);
    await sendMessage('GET_CACHE_STATS');

    // Timeout de sécurité
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      setLoading(false);
    }, 3000);
  }, [sendMessage]);

  return { stats, version, loading, fetchStats };
}

// ─── Hook pour vider le cache ──────────────────────────────────────────────
export function useCacheCleaner() {
  const { sendMessage } = useSWMessage();
  const [isClearing, setIsClearing] = useState(false);

  const clearAllCache = useCallback(async () => {
    setIsClearing(true);
    try {
      await sendMessage('CLEAR_CACHE');
      // Attendre la confirmation
      await new Promise((resolve) => {
        const handler = (event) => {
          if (event.data?.type === 'CACHE_CLEARED') {
            navigator.serviceWorker.removeEventListener('message', handler);
            resolve();
          }
        };
        navigator.serviceWorker.addEventListener('message', handler);
        setTimeout(resolve, 2000); // timeout
      });
    } finally {
      setIsClearing(false);
    }
  }, [sendMessage]);

  const clearApiCache = useCallback(async () => {
    setIsClearing(true);
    try {
      await sendMessage('CLEAR_API_CACHE');
      await new Promise((resolve) => {
        const handler = (event) => {
          if (event.data?.type === 'API_CACHE_CLEARED') {
            navigator.serviceWorker.removeEventListener('message', handler);
            resolve();
          }
        };
        navigator.serviceWorker.addEventListener('message', handler);
        setTimeout(resolve, 2000);
      });
    } finally {
      setIsClearing(false);
    }
  }, [sendMessage]);

  return { isClearing, clearAllCache, clearApiCache };
}

// ─── Hook pour forcer la mise à jour du SW ────────────────────────────────
export function useSWUpdate() {
  const { sendMessage } = useSWMessage();

  const applyUpdate = useCallback(async () => {
    await sendMessage('SKIP_WAITING');
    setTimeout(() => window.location.reload(), 300);
  }, [sendMessage]);

  const triggerSync = useCallback(async (tag = 'sync-pending-orders') => {
    await sendMessage('TRIGGER_SYNC', { tag });
  }, [sendMessage]);

  return { applyUpdate, triggerSync };
}
