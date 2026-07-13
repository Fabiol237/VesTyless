/**
 * Vestyle Offline Store (IndexedDB wrapper)
 * ✅ OPTIMISÉ v5: Connexion singleton pour éviter l'overhead de réouverture à chaque opération.
 */

const DB_NAME = 'vestyle_v5_db';
const DB_VERSION = 1;

// ── SINGLETON: une seule connexion réutilisée partout ──────────────────────
let _dbPromise = null;

function getDB() {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      _dbPromise = null; // Reset so it can retry on next call
      reject(request.error);
    };
  });

  return _dbPromise;
}

// ── LEGACY EXPORT (rétrocompatibilité) ───────────────────────────────────
export const openDB = getDB;

export const offlineStore = {
  async get(key) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('cache', 'readonly');
        const req = tx.objectStore('cache').get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('cache', 'readwrite');
        tx.objectStore('cache').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Silently fail - caching is best-effort
    }
  },

  async addToQueue(operation) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sync_queue', 'readwrite');
        tx.objectStore('sync_queue').add({ ...operation, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Silently fail
    }
  },

  async getQueue() {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('sync_queue', 'readonly');
        const req = tx.objectStore('sync_queue').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async removeFromQueue(id) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sync_queue', 'readwrite');
        tx.objectStore('sync_queue').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Silently fail
    }
  },
};
