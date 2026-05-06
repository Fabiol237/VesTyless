'use client';
import { useEffect } from 'react';

export default function PwaRegistry() {
  useEffect(() => {
    // === API #5 : WEB PUSH NOTIFICATIONS ===
    const requestPushPermission = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      // On ne demande la permission qu'une seule fois
      if (Notification.permission === 'default') {
        // On attend 5s pour ne pas agresser l'utilisateur dès son arrivée
        await new Promise(res => setTimeout(res, 5000));
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('[VesTyle] Notifications Push activées.');
          // Stocker en localStorage qu'on a la permission
          localStorage.setItem('push_permission', 'granted');
        }
      }
    };

    // Enregistrement du Service Worker (production uniquement pour éviter les erreurs HMR dev)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('[VesTyle SW] Enregistré:', reg.scope);

          // Demander les permissions de notification
          await requestPushPermission();
        } catch (err) {
          console.log('[VesTyle SW] Échec enregistrement:', err);
        }
      });
    }

    // Pré-cache des pages principales pour le mode hors-ligne
    if ('caches' in window) {
      caches.open('vestyle-v2').then(cache => {
        const prefetchUrls = ['/', '/boutiques', '/manifest.json'];
        prefetchUrls.forEach(url => {
          fetch(url, { priority: 'low' }).then(res => cache.put(url, res)).catch(() => {});
        });
      });
    }
  }, []);

  return null;
}

// Fonction utilitaire exportée pour envoyer des notifications depuis n'importe quel composant
export function sendLocalNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon,
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
    });
  } catch (e) {
    console.log('[VesTyle Notif] Erreur:', e);
  }
}
