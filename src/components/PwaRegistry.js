'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('[Vestyle PWA] Service Worker enregistré:', reg.scope);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (Notification.permission === 'granted') {
            await syncPushSubscription(reg, user);
          } else {
            console.log('[Vestyle PWA] Permission notification:', Notification.permission);
          }
        }
      } catch (err) {
        console.error('[Vestyle PWA] Erreur init:', err);
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
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center animate-pulse">
          Mode Hors-Ligne Actif • Navigation Locale Uniquement
        </div>
      )}
      
      {/* Petit indicateur discret pour activer les notifications si nécessaire */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-bounce">
          <button 
            onClick={async () => {
              try {
                console.log('[Vestyle PWA] Demande de permission manuelle...');
                const permission = await Notification.requestPermission();
                console.log('[Vestyle PWA] Permission accordée ?', permission);
                
                if (permission === 'granted') {
                  const reg = await navigator.serviceWorker.getRegistration();
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  if (reg && user) {
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
                    alert('Notifications activées !');
                  } else {
                    alert('Erreur : Session ou Service Worker introuvable.');
                  }
                } else {
                  alert('Vous avez refusé les notifications.');
                }
              } catch (err) {
                console.error('[Vestyle PWA] Erreur manuelle:', err);
                alert('Erreur lors de l\'activation : ' + err.message);
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
