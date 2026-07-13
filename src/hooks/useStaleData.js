'use client';
/**
 * useStaleData — Hook React générique "stale-while-revalidate"
 *
 * Usage :
 *   const { data, refreshing } = useStaleData('dashboard:store123', fetchFn);
 *
 * Comportement :
 *   - Si des données sont en cache → affichées IMMÉDIATEMENT, pas de loading.
 *   - Une synchro silencieuse lance le fetcher en arrière-plan.
 *   - refreshing = true pendant la synchro (pour la barre de progression discrète).
 *   - Si pas de cache → loading = true jusqu'à la première réponse.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCached, setCached } from '@/lib/dataCache';

export function useStaleData(cacheKey, fetcher, deps = []) {
  const cached = getCached(cacheKey);

  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async () => {
    const hasCached = !!getCached(cacheKey);
    if (hasCached) {
      setRefreshing(true);
    }

    try {
      const fresh = await fetcher();
      if (!mountedRef.current) return;
      setData(fresh);
      setCached(cacheKey, fresh);
    } catch (err) {
      console.error(`[useStaleData] ${cacheKey}:`, err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, refreshing, reload: run };
}
