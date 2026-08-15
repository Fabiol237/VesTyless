'use client';
/**
 * VesTyle — OfflineSyncProvider (mis à jour pour Dexie.js)
 * Context provider global qui gère la synchronisation des opérations offline
 * (produits, commandes) dès que la connexion revient.
 * Remplace l'ancien offlineStore par Dexie.js.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const OfflineSyncContext = createContext({
  isOnline: true,
  isSyncing: false,
  processQueue: async () => {},
});

const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  // ─── Synchronisation de la queue de produits (ancien offlineStore) ─────────
  const processQueue = useCallback(async () => {
    if (isSyncing) return;

    // Import dynamique pour éviter les erreurs SSR
    let db;
    try {
      const { default: dbInstance } = await import('@/lib/db');
      db = dbInstance;
    } catch {
      return; // Dexie non dispo (SSR)
    }

    const pendingProducts = await db.table('pendingOrders')
      .where('status').equals('pending')
      .toArray()
      .catch(() => []);

    if (pendingProducts.length === 0) return;

    setIsSyncing(true);
    let synced = 0;
    console.log(`[Offline Sync] Processing ${pendingProducts.length} pending operations...`);

    for (const op of pendingProducts) {
      try {
        const payload = op.payload || op;
        let productData = { ...(payload.productData || payload) };

        // Générer les embeddings si absents
        if (!productData.text_embedding_1024 && productData.name) {
          try {
            const embedRes = await fetch('/api/products/generate-embeddings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: productData.name,
                description: productData.description || '',
                imageUrl: productData.image_url || null
              })
            });
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              if (embedData.embedding) {
                productData.text_embedding_1024 = embedData.embedding;
                productData.image_embedding_1024 = embedData.embedding;
              }
            }
          } catch (e) {
            console.warn('[Offline Sync] Failed to generate embedding', e);
          }
        }

        let success = false;
        if (payload.type === 'create_product' || op.storeId) {
          const { error } = await supabase.from('products').insert([productData]);
          success = !error;
        } else if (payload.type === 'update_product') {
          const { error } = await supabase.from('products').update(productData).eq('id', payload.productId);
          success = !error;
        } else {
          // Commande générique — POST vers /api/orders
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          success = res.ok;
        }

        if (success) {
          await db.table('pendingOrders').update(op.id, { status: 'synced' });
          synced++;
        } else {
          const newRetries = (op.retries || 0) + 1;
          await db.table('pendingOrders').update(op.id, {
            retries: newRetries,
            status: newRetries >= 3 ? 'failed' : 'pending',
          });
        }
      } catch (err) {
        console.error('[Offline Sync] Sync failed for op:', op.id, err);
      }
    }

    if (synced > 0) {
      setSyncedCount(prev => prev + synced);
      console.log(`[Offline Sync] ✅ ${synced} opération(s) synchronisée(s)`);
    }

    setIsSyncing(false);
  }, [isSyncing]);

  // ─── Écouter les changements réseau ─────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Délai pour laisser le réseau s'établir
      setTimeout(processQueue, 1500);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Synchroniser au démarrage si online
    if (navigator.onLine) {
      setTimeout(processQueue, 2000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);

  // ─── Écouter les messages du Service Worker ────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      const { type } = event.data || {};
      if (type === 'SYNC_COMPLETE') {
        console.log('[OfflineSyncProvider] SW Sync complete:', event.data);
        processQueue();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [processQueue]);

  return (
    <OfflineSyncContext.Provider value={{ isOnline, isSyncing, processQueue, syncedCount }}>
      {children}
      {/* Petit toast de synchro discret (non-intrusif, en bas à droite) */}
      {isSyncing && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 9997,
          background: 'rgba(18,140,126,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(18,140,126,0.4)',
          color: 'white',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '-0.01em',
          animation: 'fadeInRight 0.3s ease',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#25D366',
            animation: 'pulse 1s ease-in-out infinite',
          }} />
          Synchronisation en cours...
          <style>{`
            @keyframes fadeInRight {
              from { transform: translateX(20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </OfflineSyncContext.Provider>
  );
};

export default OfflineSyncProvider;

export const useOfflineSyncContext = () => useContext(OfflineSyncContext);
