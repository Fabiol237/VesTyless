import { useState, useEffect, useRef } from 'react';
import { offlineStore } from '@/lib/offlineStore';

/**
 * Hook de haute performance pour charger des données instantanément (IDB Cache-First)
 */
export function useOfflineData(key, fetchQuery, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 1. CHARGEMENT INSTANTANÉ DEPUIS INDEXEDDB
      try {
        const cached = await offlineStore.get(key);
        if (cached && mounted) {
          setData(cached);
          setLoading(false);
          
          // Stratégie intelligéante : si le cache date de moins de 5 minutes, 
          // on ne re-fetch pas forcément tout de suite (sauf si c'est le premier montage)
          const lastUpdate = localStorage.getItem(`vestyle_ts_${key}`);
          const age = Date.now() - (parseInt(lastUpdate) || 0);
          if (age < 300000 && !isInitialMount.current) return;
        }
      } catch (e) {
        console.warn('[Offline] IDB get failed, falling back to network', e);
      }

      // 2. MISE À JOUR SILENCIEUSE DEPUIS LE RÉSEAU
      try {
        const { data: freshData, error: fetchError } = await fetchQuery();
        if (fetchError) throw fetchError;

        if (mounted && freshData) {
          setData(freshData);
          await offlineStore.set(key, freshData);
          localStorage.setItem(`vestyle_ts_${key}`, Date.now().toString());
        }
      } catch (err) {
        console.error(`[Offline] Network error for ${key}:`, err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
        isInitialMount.current = false;
      }
    };

    loadData();

    return () => { mounted = false; };
  }, dependencies);

  return { data, loading, error };
}
