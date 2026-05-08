'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook pour récupérer des données avec une stratégie 'Cache-First' (Offline)
 * @param {string} key - Clé unique pour le cache local
 * @param {Function} fetchQuery - Fonction retournant une promesse Supabase
 * @param {Array} dependencies - Dépendances pour re-déclencher le fetch
 */
export function useOfflineData(key, fetchQuery, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 1. Charger depuis le cache local immédiatement (Ultra-rapide)
      const cached = localStorage.getItem(`vestyle_cache_${key}`);
      if (cached && mounted) {
        setData(JSON.parse(cached));
        setLoading(false); // On arrête le loading dès qu'on a le cache
      }

      // 2. Tenter de mettre à jour depuis le réseau
      try {
        const { data: freshData, error: fetchError } = await fetchQuery();
        
        if (fetchError) throw fetchError;

        if (mounted && freshData) {
          setData(freshData);
          // Mettre à jour le cache pour la prochaine fois
          localStorage.setItem(`vestyle_cache_${key}`, JSON.stringify(freshData));
        }
      } catch (err) {
        console.error(`[Offline Engine] Erreur chargement ${key}:`, err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, dependencies);

  return { data, loading, error };
}
