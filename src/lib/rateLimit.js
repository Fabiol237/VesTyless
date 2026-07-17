// Système de Rate Limiting en mémoire (In-Memory Rate Limiter) pour Next.js Server
// Permet de bloquer les attaques et les surcharges de requêtes avant qu'elles n'atteignent Supabase

const tracker = new Map();

// Nettoyage régulier de la mémoire toutes les 5 minutes pour éviter les fuites
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of tracker.entries()) {
      if (now - data.resetTime > 60000) {
        tracker.delete(ip);
      }
    }
  }, 300000);
}

/**
 * Vérifie si une IP a dépassé sa limite de requêtes
 * @param {string} ip - Adresse IP du client
 * @param {number} limit - Nombre max de requêtes autorisées
 * @param {number} windowMs - Fenêtre de temps en millisecondes (ex: 60000 pour 1 min)
 * @returns {Promise<{success: boolean, current: number, limit: number}>}
 */
export async function rateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  
  if (!tracker.has(ip)) {
    tracker.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return { success: true, current: 1, limit };
  }
  
  const data = tracker.get(ip);
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
    return { success: true, current: 1, limit };
  }
  
  data.count++;
  
  if (data.count > limit) {
    return { success: false, current: data.count, limit };
  }
  
  return { success: true, current: data.count, limit };
}
