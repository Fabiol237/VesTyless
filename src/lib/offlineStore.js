/**
 * Vestyle Offline Store (IndexedDB wrapper)
 * Optimized for high-speed local data access and background sync.
 */

const DB_NAME = 'vestyle_v4_db';
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Store for products/stores data
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
      // Store for pending operations (sync queue)
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const offlineStore = {
  async get(key) {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('cache', 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  },

  async set(key, value) {
    const db = await openDB();
    const transaction = db.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    store.put(value, key);
    return transaction.complete;
  },

  async addToQueue(operation) {
    const db = await openDB();
    const transaction = db.transaction('sync_queue', 'readwrite');
    const store = transaction.objectStore('sync_queue');
    store.add({ ...operation, timestamp: Date.now() });
    return transaction.complete;
  },

  async getQueue() {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('sync_queue', 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async removeFromQueue(id) {
    const db = await openDB();
    const transaction = db.transaction('sync_queue', 'readwrite');
    const store = transaction.objectStore('sync_queue');
    store.delete(id);
    return transaction.complete;
  }
};
