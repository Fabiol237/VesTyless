import confetti from 'canvas-confetti';

/**
 * VesTyle — Confetti Helper
 * Effets visuels festifs pour célèbrer les événements clés (Commandes, Création de boutique).
 */

/**
 * Effet Feux d'artifice / Canon de confettis festif complet
 */
export function triggerCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  // Cannons multiples
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#2563eb', '#10b981', '#f59e0b']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#ec4899', '#8b5cf6', '#3b82f6']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#22c55e', '#eab308', '#ef4444']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Pluie dorée / Émeraude rapide pour les petites victoires (Ajout favori / Reçu téléchargé)
 */
export function triggerSuccessPop() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
    zIndex: 9999,
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
    zIndex: 9999,
  });
}
