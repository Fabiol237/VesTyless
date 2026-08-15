'use client';
/**
 * VesTyle — OfflineStatusBanner
 * Bandeau glassmorphism animé qui informe l'utilisateur de son état réseau.
 * Apparaît en bas de l'écran avec des animations fluides.
 */
import { useEffect, useState } from 'react';
import { useOfflineSync, useServiceWorkerRegistration } from '@/hooks/useOfflineSync';

export default function OfflineStatusBanner() {
  const {
    isOnline,
    isOffline,
    pendingCount,
    isSyncing,
    justReconnected,
    syncNow,
  } = useOfflineSync();

  const { updateAvailable, applyUpdate } = useServiceWorkerRegistration();

  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      setWasOffline(true);
    } else if (justReconnected && wasOffline) {
      // Afficher brièvement le bandeau "Connexion rétablie"
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (isOnline && !justReconnected) {
      setVisible(false);
    }
  }, [isOffline, isOnline, justReconnected, wasOffline]);

  if (!visible && !updateAvailable) return null;

  // ─── Bandeau mise à jour disponible ──────────────────────────────────────
  if (updateAvailable && isOnline) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0 16px',
        animation: 'slideDownBanner 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '0 0 16px 16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          color: 'white',
          fontSize: 14,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{ fontWeight: 600 }}>Nouvelle version disponible !</span>
          </div>
          <button
            onClick={applyUpdate}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8,
              padding: '6px 14px',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Mettre à jour
          </button>
        </div>
        <style>{`
          @keyframes slideDownBanner {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── Bandeau connexion rétablie ───────────────────────────────────────────
  if (isOnline && justReconnected && wasOffline) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'popUpToast 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 50,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 32px rgba(5, 150, 105, 0.5)',
          color: 'white',
          fontSize: 14,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 16 }}>
            {isSyncing ? '🔄' : '✅'}
          </span>
          <span>
            {isSyncing
              ? `Connexion rétablie • Synchronisation...`
              : `Connexion rétablie${pendingCount === 0 ? ' ✓' : ''}`
            }
          </span>
          {pendingCount > 0 && !isSyncing && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 12,
            }}>
              {pendingCount} action{pendingCount > 1 ? 's' : ''} synchronisée{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <style>{`
          @keyframes popUpToast {
            from { transform: translateX(-50%) translateY(20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── Bandeau mode offline ─────────────────────────────────────────────────
  if (isOffline) {
    return (
      <>
        <style>{`
          @keyframes slideUpOffline {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulseDot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .offline-sync-btn:hover {
            background: rgba(255,255,255,0.15) !important;
          }
          .offline-sync-btn:active {
            transform: scale(0.97);
          }
        `}</style>
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          padding: '12px 16px 20px',
          animation: 'slideUpOffline 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          background: 'linear-gradient(to top, rgba(17,27,33,0.98) 0%, rgba(17,27,33,0.90) 100%)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            {/* Indicateur + message */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              {/* Dot clignotant */}
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#EF4444',
                flexShrink: 0,
                animation: 'pulseDot 1.5s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(239,68,68,0.6)',
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.01em',
                }}>
                  Mode hors-ligne
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 11,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginTop: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {pendingCount > 0
                    ? `${pendingCount} action${pendingCount > 1 ? 's' : ''} en attente de sync`
                    : 'Les données en cache restent disponibles'
                  }
                </div>
              </div>
            </div>

            {/* Badge panier en attente (si > 0) + bouton sync */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {pendingCount > 0 && (
                <div style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 20,
                  padding: '4px 10px',
                  color: '#FCA5A5',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {pendingCount} en attente
                </div>
              )}
              <button
                className="offline-sync-btn"
                onClick={syncNow}
                disabled={isSyncing}
                title="Réessayer la synchronisation"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '7px 14px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: isSyncing ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: isSyncing ? 0.5 : 1,
                }}
              >
                <span style={{
                  display: 'inline-block',
                  animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                  fontSize: 14,
                }}>
                  🔄
                </span>
                {isSyncing ? 'Sync...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>

        {/* Override spin animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return null;
}
