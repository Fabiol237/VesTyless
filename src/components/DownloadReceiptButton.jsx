'use client';
import { useState } from 'react';
import { generatePDFReceipt } from '@/lib/pdfReceipt';
import { triggerFeedback } from '@/lib/haptic';
import { triggerCelebrationConfetti } from '@/lib/confetti';

/**
 * VesTyle — DownloadReceiptButton
 * Bouton réutilisable pour télécharger la facture / reçu officiel au format PDF.
 */
export default function DownloadReceiptButton({ order, className = "", label = "Télécharger Reçu PDF" }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!order) return;

    triggerFeedback('pop');
    setDownloading(true);
    try {
      await generatePDFReceipt(order);
      triggerFeedback('success');
      triggerCelebrationConfetti();
    } catch (err) {
      console.error('[PDF Receipt Error]:', err);
      alert('Erreur lors de la génération du reçu PDF : ' + (err.message || 'Problème technique'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading || !order}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={downloading ? 'animate-bounce' : ''}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
      <span>{downloading ? 'Génération du PDF...' : label}</span>
    </button>
  );
}
