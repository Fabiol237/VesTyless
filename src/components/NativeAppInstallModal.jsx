'use client';
import { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, Smartphone, CheckCircle, X, Sparkles } from 'lucide-react';

export default function NativeAppInstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'app tourne déjà en mode autonome (PWA installée ou Capacitor/APK)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Écouter l'événement standard d'installation Android/Chrome
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Vérifier si l'utilisateur a fermé l'invitation récemment
    const dismissedTimestamp = localStorage.getItem('vestyle_install_dismissed');
    if (dismissedTimestamp) {
      const now = Date.now();
      // Réafficher après 24 heures
      if (now - parseInt(dismissedTimestamp, 10) < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignorer
      }
    }
  };

  const handleInstallClick = async () => {
    triggerHaptic();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic();
    setIsDismissed(true);
    setIsOpen(false);
    localStorage.setItem('vestyle_install_dismissed', Date.now().toString());
  };

  // Si déjà en mode natif autonome, ne rien afficher
  if (isStandalone) return null;

  return (
    <>
      {/* 🚀 Barre / Bouton Flottant d'Installation Native */}
      {!isDismissed && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9990,
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
          animation: 'vsSlideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(18, 140, 126, 0.95) 0%, rgba(7, 94, 84, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 12px 35px rgba(18, 140, 126, 0.35), 0 4px 12px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}>
                <Smartphone size={24} color="#128C7E" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Installer l'App VeStyle</span>
                  <Sparkles size={13} color="#fde047" />
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Ultra-rapide • Sans navigateur • Zéro bug
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleInstallClick}
                style={{
                  background: '#ffffff',
                  color: '#075E54',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '9px 14px',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Download size={14} strokeWidth={2.5} />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Fermer"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Modal Guide d'Installation Spécifique (iOS / Android / APK) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 99999,
          animation: 'vsFadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '420px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            color: '#1e293b',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 10px 25px rgba(18, 140, 126, 0.3)'
              }}>
                <Smartphone size={32} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Application VeStyle Officielle
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Profitez d'une expérience 100% autonome et fluide, sans aucune barre de navigateur.
              </p>
            </div>

            {/* Guide Spécifique pour iPhone (iOS Safari) */}
            {isIOS ? (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', color: '#0f172a' }}>
                  📱 Installation sur iPhone / iPad :
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', background: '#e0f2fe',
                    color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0
                  }}>1</div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>
                    Appuyez sur le bouton <strong>Partager</strong> <Share2 size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284c7' }} /> en bas de Safari.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', background: '#e0f2fe',
                    color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0
                  }}>2</div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>
                    Faites défiler et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284c7' }} />.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', background: '#e0f2fe',
                    color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0
                  }}>3</div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>
                    Appuyez sur <strong>Ajouter</strong> en haut à droite. C'est prêt ! 🎉
                  </div>
                </div>
              </div>
            ) : (
              /* Guide Android / Chrome */
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Fonctionne 100% hors-ligne</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Alertes commandes instantanées</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Zéro stockage gaspillé</span>
                </div>
              </div>
            )}

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(18, 140, 126, 0.3)',
                  marginBottom: '10px'
                }}
              >
                Confirmer l'installation
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes vsSlideUpModal {
          from { transform: translate(-50%, 60px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes vsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
