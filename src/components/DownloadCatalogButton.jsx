'use client';

import React, { useState } from 'react';
import { generateStorePDFCatalog } from '@/lib/pdfCatalog';
import { triggerSuccessPop } from '@/lib/confetti';
import { Download, FileText, Loader2 } from 'lucide-react';

/**
 * DownloadCatalogButton — Bouton d'exportation du Catalogue PDF Marchand avec QR Code
 */
export default function DownloadCatalogButton({ store, products = [], variant = 'default' }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!store) {
      alert('Veuillez sélectionner une boutique valide.');
      return;
    }

    setDownloading(true);
    try {
      await generateStorePDFCatalog(store, products);
      triggerSuccessPop();
    } catch (e) {
      console.error('Erreur génération catalogue PDF:', e);
      alert('Erreur lors de la génération du catalogue PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
        title="Télécharger le catalogue PDF de la boutique avec QR Code"
      >
        {downloading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileText size={14} />
        )}
        <span>PDF Catalogue</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 hover:from-blue-900 hover:to-slate-900 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl shadow-xl border border-blue-500/30 hover:border-blue-400 transition-all active:scale-95 disabled:opacity-50 group"
    >
      {downloading ? (
        <Loader2 size={18} className="animate-spin text-blue-400" />
      ) : (
        <Download size={18} className="text-blue-400 group-hover:translate-y-0.5 transition-transform" />
      )}
      <span>{downloading ? 'Génération du PDF...' : '📑 Télécharger Catalogue PDF avec QR Code'}</span>
    </button>
  );
}
