'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; 

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
      // Empêcher l'apparition automatique du bandeau natif
      e.preventDefault();
      deferredPrompt = e;
      
      // On peut proposer l'installation au bout d'un moment d'utilisation
      setTimeout(() => {
        if (localStorage.getItem('pwa_installed') !== 'true') {
           console.log('[Vestyle PWA] Prêt pour installation discrète.');
           // Ici on pourrait afficher une petite bannière personnalisée non intrusive
        }
      }, 10000);
    });

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      console.log('[Vestyle PWA] Installé avec succès.');
    });

    // === ENREGISTREMENT ET ABONNEMENT ===
    const initPwa = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        
        // Souscription Push si connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await requestPushPermission(reg, user);
        }

        // Pré-chargement des pages critiques pour le mode hors-ligne
        if ('caches' in window) {
          const cache = await caches.open('vestyle-v3-static');
          const criticalPages = ['/', '/boutiques', '/admin', '/utilisateurs', '/finances', '/produits'];
          criticalPages.forEach(page => {
            fetch(page, { priority: 'low' }).then(res => cache.put(page, res)).catch(() => {});
          });
        }
      } catch (err) {
        console.error('[Vestyle PWA] Erreur:', err);
      }
    };

    const requestPushPermission = async (reg, user) => {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY
          });
          await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            email: user.email,
            subscription: sub
          });
        }
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
    </>
  );
}
