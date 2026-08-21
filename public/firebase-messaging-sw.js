/**
 * VeStyle — Firebase Messaging Service Worker
 * ─────────────────────────────────────────────────────────────────────────────
 * Ce fichier DOIT être à la racine du domaine (/firebase-messaging-sw.js)
 * pour que Firebase Cloud Messaging fonctionne en arrière-plan.
 * 
 * Il reçoit les notifications push quand l'app est fermée ou en arrière-plan.
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (doit correspondre à celle dans .env.local)
firebase.initializeApp({
  apiKey:            'AIzaSyAQj9STZKYqyYngQYUbc0NtDmbp1haszlc',
  authDomain:        'vestyle.firebaseapp.com',
  projectId:         'vestyle',
  storageBucket:     'vestyle.firebasestorage.app',
  messagingSenderId: '425690312805',
  appId:             '1:425690312805:web:113499f10b8b390a3dd68c',
});

const messaging = firebase.messaging();

// ─── Gestion des messages en arrière-plan ─────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] Message reçu en arrière-plan:', payload);

  const { title, body, icon, image } = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = title || 'VeStyle';
  const notificationOptions = {
    body:   body   || 'Vous avez une nouvelle notification.',
    icon:   icon   || '/icon-192.png',
    badge:  '/icon-192.png',
    image:  image  || undefined,
    tag:    data.type || 'vestyle-notif',
    data:   {
      url:  data.link || 'https://ves-tyless.vercel.app',
      ...data,
    },
    actions: getActions(data.type),
    requireInteraction: data.type === 'new_order', // reste visible pour les commandes
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ─── Actions selon le type de notification ────────────────────────────────────
function getActions(type) {
  switch (type) {
    case 'new_order':
      return [
        { action: 'view_order',   title: '👁️ Voir la commande' },
        { action: 'dismiss',      title: '✕ Ignorer' },
      ];
    case 'new_message':
      return [
        { action: 'reply',        title: '💬 Répondre' },
        { action: 'dismiss',      title: '✕ Ignorer' },
      ];
    default:
      return [
        { action: 'open',         title: '🔗 Ouvrir VeStyle' },
      ];
  }
}

// ─── Clic sur la notification ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data   = event.notification.data || {};
  const url    = data.url || 'https://ves-tyless.vercel.app/dashboard';

  if (action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Ouvrir un onglet existant si possible
      for (const client of clientList) {
        if (client.url.includes('ves-tyless.vercel.app') && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', action, data });
          return;
        }
      }
      // Sinon ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
