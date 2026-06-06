'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { offlineStore } from '@/lib/offlineStore';
import { supabase } from '@/lib/supabase';

const OfflineSyncContext = createContext();

const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) processQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueue = async () => {
    if (isSyncing) return;
    const queue = await offlineStore.getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    console.log(`[Offline Sync] Processing ${queue.length} operations...`);

    for (const op of queue) {
      try {
        let productData = { ...op.data };

        // Generate embeddings if they don't exist
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

        if (op.type === 'create_product') {
          const { error } = await supabase.from('products').insert([productData]);
          if (!error) await offlineStore.removeFromQueue(op.id);
        } else if (op.type === 'update_product') {
          const { error } = await supabase.from('products').update(productData).eq('id', op.productId);
          if (!error) await offlineStore.removeFromQueue(op.id);
        }
      } catch (err) {
        console.error('[Offline Sync] Sync failed for op:', op, err);
      }
    }

    setIsSyncing(false);
  };

  return (
    <OfflineSyncContext.Provider value={{ isOnline, isSyncing, processQueue }}>
      {children}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 bg-wa-teal rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Synchronisation en cours...</span>
        </div>
      )}
    </OfflineSyncContext.Provider>
  );
};

export default OfflineSyncProvider;

export const useOfflineSync = () => useContext(OfflineSyncContext);
