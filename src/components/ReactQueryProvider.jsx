'use client';
/**
 * VesTyle — ReactQueryProvider
 * Fournisseur TanStack Query v5 configuré pour une réactivité native-like :
 * - Prefetching instantané au survol
 * - Cache mémoire de 30 minutes
 * - Pas de re-fetches inutiles au changement d'onglet
 * - Intégration optimale avec Dexie.js et Service Worker
 */
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes stale time
            gcTime: 1000 * 60 * 30,   // 30 minutes garbage collection
            refetchOnWindowFocus: false, // Ne pas recharger sur focus fenêtre
            refetchOnReconnect: true,  // Recharger sur la reconnexion réseau
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
