'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFirebaseNotifications } from '@/hooks/useFirebaseNotifications';

const OfflineStatusBanner = dynamic(() => import('@/components/OfflineStatusBanner'), { ssr: false });
const NativeAppInstallModal = dynamic(() => import('@/components/NativeAppInstallModal'), { ssr: false });

export default function PwaRegistry() {
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    isSupported,
    permission,
    notification,
    requestPermission,
  } = useFirebaseNotifications();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online',  on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Enregistrer le Service Worker PWA
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(reg => {
        console.log('[VeStyle PWA] SW enregistré:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw?.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              if (confirm('🎉 Nouvelle version VeStyle disponible ! Mettre à jour ?')) window.location.reload();
            }
          });
        });
      })
      .catch(err => console.error('[VeStyle PWA]', err));
  }, []);

  // Afficher prompt après 3s si pas encore accordé
  useEffect(() => {
    if (!isSupported || permission === 'granted') return;
    const t = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(t);
  }, [isSupported, permission]);

  // Toast quand notification reçue en premier plan
  useEffect(() => {
    if (!notification) return;
    setToast(notification);
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleActivate = async () => {
    setShowPrompt(false);
    const ok = await requestPermission();
    if (ok) {
      setToast({ title: '✅ Notifications activées !', body: 'Alertes VeStyle en temps réel activées.' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      <OfflineStatusBanner />
      <NativeAppInstallModal />

      {/* Toast notification premier plan */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 9999,
          maxWidth: '340px', width: '100%',
          animation: 'vsSlideInRight 0.4s ease-out',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px', padding: '16px 20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'white',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>
              {toast.data?.type === 'new_order' ? '🛒' : toast.data?.type === 'new_message' ? '💬' : '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.4 }}>{toast.body}</div>
            </div>
            <button onClick={() => setToast(null)} style={{
              color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0,
            }}>✕</button>
          </div>
        </div>
      )}

      {/* Prompt activation notifications */}
      {showPrompt && isOnline && permission !== 'granted' && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998,
          animation: 'vsSlideInUp 0.5s ease-out',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px', padding: '20px',
            boxShadow: '0 20px 60px rgba(102,126,234,0.45)',
            color: 'white', maxWidth: '280px', position: 'relative',
          }}>
            <button onClick={() => setShowPrompt(false)} style={{
              position: 'absolute', top: '10px', right: '14px',
              color: 'rgba(255,255,255,0.7)', background: 'none',
              border: 'none', cursor: 'pointer', fontSize: '16px',
            }}>✕</button>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</div>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Restez informé !</div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '14px', lineHeight: 1.5 }}>
              Recevez les alertes commandes, messages et promotions en temps réel.
            </div>
            <button onClick={handleActivate} style={{
              width: '100%', background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px',
              color: 'white', fontWeight: 700, fontSize: '13px',
              padding: '10px', cursor: 'pointer',
            }}>
              Activer les notifications
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes vsSlideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes vsSlideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
