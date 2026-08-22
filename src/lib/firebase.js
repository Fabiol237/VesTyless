// lib/firebase.js
// ─── Firebase Client — Initialisation unique ──────────────────────────────────
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialisation unique (évite les doublons en HMR Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Retourne l'instance Messaging (null si non supporté)
 */
export async function getFirebaseMessaging() {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

/**
 * Demande la permission et retourne le FCM token
 * @returns {Promise<string|null>} token FCM ou null
 */
export async function requestFCMToken() {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Register service worker explicitly to get better errors in dev
    let swRegistration = null;
    try {
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope',
        });
        console.log('[Firebase SW] enregistré:', swRegistration.scope);
      }
    } catch (swErr) {
      console.error('[Firebase SW] erreur enregistrement du service worker:', swErr);
      // continue: getToken will surface a useful error too
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration || undefined,
    });

    return token || null;
  } catch (err) {
    console.error('[Firebase FCM] Erreur token:', err);
    return null;
  }
}

/**
 * Écoute les notifications en premier plan (app ouverte)
 * @param {Function} onNotification - callback({ title, body, data })
 */
export async function onForegroundMessage(onNotification) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const { notification, data } = payload;
    onNotification({
      title: notification?.title || 'VeStyle',
      body:  notification?.body  || '',
      icon:  notification?.icon  || '/icon-192.png',
      data:  data || {},
    });
  });
}

export { app };
