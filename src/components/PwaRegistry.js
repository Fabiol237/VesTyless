'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const OfflineStatusBanner = dynamic(() => import('@/components/OfflineStatusBanner'), { ssr: false });

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; 

// Helper pour convertir la clé VAPID
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

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // === GESTION DE L'INSTALLATION DISCRÈTE ===
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[Vestyle PWA] Prêt pour installation.');
    });

    // === ENREGISTREMENT ET ABONNEMENT ===
    const initPwa = async () => {
      if (!('serviceWorker' in navigator)) {
        console.warn('[Vestyle PWA] Service Worker non supporté.');
        return;
      }

      // Désactiver le Service Worker en mode DEV (localhost) pour préserver HMR & Fast Refresh
      if (process.env.NODE_ENV === 'development') {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            await r.unregister();
          }
          console.log('[Vestyle PWA] Service Worker nettoyé en mode DEV.');
        } catch { /* silencieux */ }
        return;
      }

      try {
        let reg = await navigator.serviceWorker.getRegistration('/');
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        }
        console.log('[Vestyle PWA] Service Worker enregistré:', reg.scope);

        // --- FORCE UPDATE LOGIC ---
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible !
              if (confirm('🎉 Une nouvelle version de Vestyle est disponible ! Voulez-vous mettre à jour ?')) {
                window.location.reload();
              }
            }
          });
        });

        // --- SYNC AUTH & PUSH (Wait for Service Worker to be active) ---
        const waitForActivation = () => {
          return new Promise((resolve) => {
            if (reg.active) {
              resolve();
            } else {
              const checkActive = setInterval(() => {
                if (reg.active) {
                  clearInterval(checkActive);
                  resolve();
                }
              }, 100);
              setTimeout(() => clearInterval(checkActive), 5000);
            }
          });
        };

        await waitForActivation();

        setTimeout(async () => {
          try {
            if (!VAPID_PUBLIC_KEY) {
              console.warn('[Vestyle PWA] VAPID_PUBLIC_KEY non configurée.');
              return;
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const user = session?.user;
            if (user && Notification.permission === 'granted') {
              await syncPushSubscription(reg, user);
            }
          } catch (err) {
            // Silence auth lock errors as they are common and self-correcting in multi-tab PWA
            if (!err.message?.includes('lock')) {
              console.warn('[Vestyle PWA] Auth sync skipped:', err.message);
            }
          }
        }, 500);

      } catch (err) {
        if (!err.message?.includes('lock')) {
          console.error('[Vestyle PWA] Erreur init:', err);
        }
      }
    };

    const syncPushSubscription = async (reg, user) => {
      try {
        let sub = await reg.pushManager.getSubscription();
        
        if (!sub) {
          console.log('[Vestyle PWA] Création d\'un nouvel abonnement...');
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        }

        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          email: user.email,
          subscription: sub
        });
        console.log('[Vestyle PWA] Abonnement Push OK.');
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

  return (
    <>
      {/* Bandeau offline premium (remplace l'ancienne barre rouge) */}
      <OfflineStatusBanner />

      {/* Bouton discret pour activer les notifications Push */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && isOnline && (
        <div className="fixed bottom-4 right-4 z-[9998]">
          <button 
            onClick={async () => {
              try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  const reg = await navigator.serviceWorker.getRegistration();
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  if (reg && user && VAPID_PUBLIC_KEY) {
                    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                    const sub = await reg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: convertedKey
                    });
                    
                    await supabase.from('push_subscriptions').upsert({
                      user_id: user.id,
                      email: user.email,
                      subscription: sub
                    });
                  }
                }
              } catch (err) {
                console.error('[Vestyle PWA] Erreur activation notifs:', err);
              }
            }}
            className="bg-wa-teal text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-tighter max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">Activer les Notifications</span>
          </button>
        </div>
      )}
    </>
  );
}
