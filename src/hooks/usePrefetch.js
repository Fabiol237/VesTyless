'use client';
/**
 * VesTyle — usePrefetch Hook
 * Permet le préchargement ultra-rapide des données au survol d'un lien (onMouseEnter)
 * pour un rendu instantané à 0ms lors du clic.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function usePrefetch() {
  const queryClient = useQueryClient();

  // Précharger une boutique et ses produits au survol du lien boutique
  const prefetchStore = useCallback((slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: ['store', slug],
      queryFn: async () => {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single();
        return storeData;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  // Précharger un produit au survol de la carte produit
  const prefetchProduct = useCallback((productId) => {
    if (!productId) return;
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
        const { data: prodData } = await supabase
          .from('products')
          .select('*, stores(*)')
          .eq('id', productId)
          .single();
        return prodData;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  return { prefetchStore, prefetchProduct };
}
