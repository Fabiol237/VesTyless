'use client';
import { useState, useEffect, useCallback } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

/**
 * Hook useFirebaseNotifications
 * Gère l'intégration complète Firebase FCM :
 * - Demande de permission
 * - Obtention et enregistrement du token FCM
 * - Écoute des messages en premier plan
 * - Affichage de toasts de notification
 *
 * @param {string} storeId - optionnel, pour associer le token à une boutique
 * @returns {{ 
 *   isSupported: boolean,
 *   permission: string,
 *   fcmToken: string|null,
 *   notification: object|null,
 *   requestPermission: Function,
 *   clearNotification: Function
 * }}
 */
export function useFirebaseNotifications(storeId = null) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);

  // Vérifier le support au montage
  useEffect(() => {
    const supported = typeof window !== 'undefined' 
      && 'Notification' in window 
      && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Écouter les messages en premier plan
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    let unsubscribe;
    onForegroundMessage((payload) => {
      setNotification(payload);
      // Auto-clear après 6 secondes
      setTimeout(() => setNotification(null), 6000);
    }).then(fn => { unsubscribe = fn; });

    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [isSupported, permission]);

  /**
   * Demande la permission et enregistre le token FCM
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const token = await requestFCMToken();
      if (!token) return false;

      setFcmToken(token);
      setPermission('granted');

      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return true; // token obtenu mais pas connecté

      // Enregistrer le token en base via l'API
      await fetch('/api/notifications/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fcmToken: token,
          userId:   user.id,
          storeId:  storeId || null,
        }),
      });

      console.log('[FCM] Token enregistré avec succès');
      return true;
    } catch (err) {
      console.error('[FCM] Erreur requestPermission:', err);
      return false;
    }
  }, [isSupported, storeId]);

  const clearNotification = useCallback(() => setNotification(null), []);

  return {
    isSupported,
    permission,
    fcmToken,
    notification,
    requestPermission,
    clearNotification,
  };
}
