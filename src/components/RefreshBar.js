'use client';
/**
 * RefreshBar — Barre de progression discrète en haut de page
 * Visible UNIQUEMENT lors d'un rafraîchissement silencieux en arrière-plan.
 * Ne bloque jamais l'interface.
 */
export default function RefreshBar({ color = '#6366f1' }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, ${color}88, ${color})`,
        backgroundSize: '200% 100%',
        animation: 'vestyle-refresh-slide 1.2s ease-in-out infinite',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes vestyle-refresh-slide {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
