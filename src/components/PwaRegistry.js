'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array(0);
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PwaRegistry() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // === INSTALLATION DISCRÈTE ===
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
    });

    // === ENREGISTREMENT SERVICE WORKER ===
    const initPwa = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const reg = await navigator.serviceWorker.register('/sw.js');

        // ✅ FIX CRITIQUE: Pas de confirm() bloquant.
        // On affiche un bandeau discret non-bloquant à la place.
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau SW prêt → informer sans bloquer
              setUpdateAvailable(true);
            }
          });
        });

        // Attendre l'activation sans polling bloquant
        if (reg.active) {
          scheduleAuthSync(reg);
        } else {
          reg.addEventListener('activate', () => scheduleAuthSync(reg), { once: true });
          navigator.serviceWorker.addEventListener('controllerchange', () => scheduleAuthSync(reg), { once: true });
        }

      } catch (err) {
        if (!err.message?.includes('lock')) {
          console.error('[Vestyle PWA] Erreur init:', err);
        }
      }
    };

    const scheduleAuthSync = (reg) => {
      // Délai court pour ne pas bloquer le rendu initial
      setTimeout(async () => {
        try {
          if (!VAPID_PUBLIC_KEY) return;
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          if (user && 'Notification' in window && Notification.permission === 'granted') {
            await syncPushSubscription(reg, user);
          }
        } catch (err) {
          if (!err.message?.includes('lock')) {
            console.warn('[Vestyle PWA] Auth sync skipped:', err.message);
          }
        }
      }, 1500);
    };

    const syncPushSubscription = async (reg, user) => {
      try {
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          email: user.email,
          subscription: sub,
        });
      } catch (err) {
        console.error('[Vestyle PWA] Erreur synchro Push:', err);
      }
    };

    initPwa();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleApplyUpdate = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Bandeau hors-ligne */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center animate-pulse">
          Mode Hors-Ligne Actif • Navigation Locale Uniquement
        </div>
      )}

      {/* ✅ Bandeau de mise à jour non-bloquant (remplace confirm()) */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] flex items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <p className="text-xs font-bold">Nouvelle version disponible !</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setUpdateAvailable(false)} className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-white transition-colors px-2">
              Plus tard
            </button>
            <button onClick={handleApplyUpdate} className="text-[10px] font-black uppercase tracking-wider bg-wa-teal text-white px-3 py-1.5 rounded-xl hover:bg-emerald-500 transition-colors">
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* Bouton notifications discret */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
        <div className="fixed bottom-4 right-4 z-[9998]">
          <button
            onClick={async () => {
              try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  const reg = await navigator.serviceWorker.getRegistration();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (reg && user && VAPID_PUBLIC_KEY) {
                    const sub = await reg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                    });
                    await supabase.from('push_subscriptions').upsert({ user_id: user.id, email: user.email, subscription: sub });
                  }
                }
              } catch (err) {
                console.error('[Vestyle PWA] Erreur notifications:', err);
              }
            }}
            className="bg-wa-teal text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-tighter max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
              Activer les Notifications
            </span>
          </button>
        </div>
      )}
    </>
  );
}
