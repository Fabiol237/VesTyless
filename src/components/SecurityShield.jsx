'use client';
/**
 * VesTyle — SecurityShield (Protection Ultime Anti-Robots & Anti-Vol)
 * - Désarme les raccourcis d'inspection (F12, Ctrl+U, Ctrl+Shift+I/J/C, Ctrl+S)
 * - Empêche le clic droit contextuel sur les zones sensibles
 * - Détecte les navigateurs automatisés (Selenium, Puppeteer, Playwright via navigator.webdriver)
 * - Masque les erreurs et nettoie la console en production
 */
import { useEffect } from 'react';

export default function SecurityShield() {
  useEffect(() => {
    // ── En environnement de développement ou localhost : Ne pas bloquer ──
    if (
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ) {
      return;
    }

    // ── 1. DÉTECTION DES ROBOTS DE NAVIGATEUR AUTOMATISÉ (Selenium / Puppeteer) ──
    const checkAutomatedBot = () => {
      const isWebDriver = navigator.webdriver || window.__nightmare || window.callPhantom || window._phantom;
      const isHeadless = /HeadlessChrome/.test(navigator.userAgent);

      if (isWebDriver || isHeadless) {
        console.warn('[SECURITY] Robot d\'automatisation détecté. Accès restreint.');
        document.body.innerHTML = `
          <div style="background:#111B21; color:#EF4444; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
            <h1 style="font-size:32px; font-weight:900; margin-bottom:12px;">🚫 ACCÈS BLOQUÉ</h1>
            <p style="color:#aaa; max-width:400px; line-height:1.6;">L'utilisation de navigateurs automatisés (Puppeteer, Selenium, Headless) est strictement interdite sur VeStyle.</p>
          </div>
        `;
      }
    };

    checkAutomatedBot();

    // ── 2. DÉSOUDER LES RACCOURCIS D'INSPECTION DE CODE ─────────────────────────
    const handleKeyDown = (e) => {
      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+U (Voir le code source HTML)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspecteur d'éléments & Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S / Cmd+S (Sauvegarder la page complète)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    // ── 3. BLOQUER LE CLIC DROIT CONTEXTUEL SUR BUILDER / DASHBOARD / ADMIN ──────
    const handleContextMenu = (e) => {
      const isSensitivePage = window.location.pathname.includes('/mes-sites') ||
                              window.location.pathname.includes('/dashboard') ||
                              window.location.pathname.includes('/admin');
      if (isSensitivePage) {
        e.preventDefault();
        return false;
      }
    };

    // ── 4. DESACTIVER LE DRAG & DROP DES IMAGES (Empêche de glisser les images pour les voler) ──
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
