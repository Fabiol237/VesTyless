'use client';
import { useEffect } from 'react';

export default function PwaRegistry() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          // Check for updates every 30 minutes
          setInterval(() => reg.update(), 30 * 60 * 1000);
        })
        .catch(err => console.error('[PWA] SW registration failed:', err));
    }

    // Prefetch key routes for offline + speed
    const prefetchUrls = ['/', '/boutiques', '/search'];
    if ('caches' in window) {
      caches.open('vestyle-v2').then(cache => {
        prefetchUrls.forEach(url => {
          fetch(url, { priority: 'low' }).then(res => cache.put(url, res)).catch(() => {});
        });
      });
    }
  }, []);

  return null;
}
