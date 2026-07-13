/**
 * dataCache.js — Cache mémoire global (stale-while-revalidate)
 *
 * Principes :
 *  - Les données sont gardées en mémoire tant que l'onglet navigateur est ouvert.
 *  - Au retour sur une page, les anciennes données s'affichent IMMÉDIATEMENT.
 *  - Une synchro silencieuse se fait en arrière-plan sans bloquer l'interface.
 *  - Aucun spinner complet, seulement une fine barre de progression discrète.
 */

// ─── Cache global (clé → { data, ts }) ─────────────────────────────────────
const _cache = {};

// Charger le cache depuis le localStorage au démarrage (côté client uniquement)
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('vestyle_cache_store');
    if (raw) {
      Object.assign(_cache, JSON.parse(raw));
    }
  } catch (err) {
    console.error('[dataCache] Error loading from localStorage:', err);
  }
}

function saveToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('vestyle_cache_store', JSON.stringify(_cache));
    } catch (err) {
      console.error('[dataCache] Error writing to localStorage:', err);
    }
  }
}

/**
 * Lit une valeur du cache.
 * @param {string} key
 * @returns {any | undefined}
 */
export function getCached(key) {
  return _cache[key]?.data;
}

/**
 * Écrit une valeur dans le cache.
 * @param {string} key
 * @param {any} data
 */
export function setCached(key, data) {
  _cache[key] = { data, ts: Date.now() };
  saveToLocalStorage();
}

/**
 * Vide une entrée du cache (ex : après suppression d'un produit).
 * @param {string} key
 */
export function invalidate(key) {
  delete _cache[key];
  saveToLocalStorage();
}

/**
 * Vide toutes les entrées dont la clé commence par un préfixe.
 * @param {string} prefix
 */
export function invalidatePrefix(prefix) {
  Object.keys(_cache).forEach(k => { if (k.startsWith(prefix)) delete _cache[k]; });
  saveToLocalStorage();
}

