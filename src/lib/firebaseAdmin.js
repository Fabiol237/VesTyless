// lib/firebaseAdmin.js
// ─── Firebase Admin SDK — Côté serveur uniquement ────────────────────────────
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let adminApp;

function getAdminApp() {
  if (adminApp) return adminApp;
  
  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  adminApp = initializeApp({
    credential: cert({
      projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return adminApp;
}

/**
 * Envoie une notification FCM à un token spécifique
 * @param {string} fcmToken - token de l'appareil
 * @param {object} notification - { title, body, icon? }
 * @param {object} data - données supplémentaires
 */
export async function sendFCMNotification(fcmToken, notification, data = {}) {
  try {
    const app = getAdminApp();
    const messaging = getMessaging(app);

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body:  notification.body,
        imageUrl: notification.icon || 'https://ves-tyless.vercel.app/icon-192.png',
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        fcmOptions: {
          link: notification.link || 'https://ves-tyless.vercel.app',
        },
        notification: {
          icon:  notification.icon  || '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
        },
      },
    };

    const response = await messaging.send(message);
    console.log('[Firebase Admin] Notification envoyée:', response);
    return { success: true, messageId: response };
  } catch (err) {
    console.error('[Firebase Admin] Erreur envoi:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Envoie une notification à plusieurs tokens (multicast)
 * @param {string[]} fcmTokens - tableau de tokens
 * @param {object} notification - { title, body }
 * @param {object} data
 */
export async function sendFCMMulticast(fcmTokens, notification, data = {}) {
  if (!fcmTokens?.length) return { success: false, error: 'Aucun token' };

  try {
    const app = getAdminApp();
    const messaging = getMessaging(app);

    const message = {
      tokens: fcmTokens.slice(0, 500), // FCM max 500 tokens par batch
      notification: {
        title: notification.title,
        body:  notification.body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        fcmOptions: {
          link: notification.link || 'https://ves-tyless.vercel.app',
        },
        notification: {
          icon:  '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: true,
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`[Firebase Admin] Multicast: ${response.successCount} succès, ${response.failureCount} échecs`);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (err) {
    console.error('[Firebase Admin] Erreur multicast:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Envoie une notif de nouvelle commande au vendeur
 */
export async function notifyNewOrder({ vendorToken, order, storeName }) {
  return sendFCMNotification(
    vendorToken,
    {
      title: `🛒 Nouvelle commande — ${storeName}`,
      body:  `${order.customer_name} a commandé pour ${order.total?.toLocaleString()} FCFA`,
      link:  `https://ves-tyless.vercel.app/dashboard`,
    },
    {
      type:       'new_order',
      orderId:    order.id || '',
      storeName,
      customerName: order.customer_name || '',
    }
  );
}

/**
 * Envoie une notif de message chat au vendeur
 */
export async function notifyNewChatMessage({ vendorToken, customerMessage, storeName, storeId }) {
  return sendFCMNotification(
    vendorToken,
    {
      title: `💬 Message — ${storeName}`,
      body:  customerMessage.slice(0, 100),
      link:  `https://ves-tyless.vercel.app/dashboard`,
    },
    {
      type:    'new_message',
      storeId: storeId || '',
      storeName,
    }
  );
}
