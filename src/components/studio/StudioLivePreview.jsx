'use client';

import React, { useMemo, useState } from 'react';
import UniversalStorefrontRenderer from '@/components/storefront/UniversalStorefrontRenderer';
import { adaptStoreToBusinessProfile } from '@/lib/business-profile/businessProfileAdapter';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw, Eye, Sparkles } from 'lucide-react';

export default function StudioLivePreview({
  store,
  products = [],
  modules = [],
  customOptions = {},
  initialDevice = 'desktop',
}) {
  const [deviceMode, setDeviceMode] = useState(initialDevice);
  const [activePageId, setActivePageId] = useState('home');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Génération déterministe du BusinessProfile canonique en direct
  const profile = useMemo(() => {
    if (!store) return null;
    try {
      return adaptStoreToBusinessProfile(store, products, modules, customOptions);
    } catch (err) {
      console.warn('[StudioLivePreview] Erreur adaptation profil:', err);
      return null;
    }
  }, [store, products, modules, customOptions]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const deviceWidthMap = {
    desktop: 'w-full max-w-none',
    tablet:  'w-[768px] max-w-[768px]',
    mobile:  'w-[390px] max-w-[390px]',
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Top Bar Contrôles ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu en Direct</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-[150px]">{store?.name || 'Boutique'}</span>
        </div>

        {/* Sélecteur de viewport responsive */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === 'desktop'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vue Desktop (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === 'tablet'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vue Tablette (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === 'mobile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vue Mobile (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions : Refresh & External Link */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Rafraîchir l'aperçu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          {store?.slug && (
            <a
              href={`/boutique/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] transition border border-emerald-500/30"
              title="Ouvrir la vitrine réelle"
            >
              <span>Voir en ligne</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── Zone de Rendu Live ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 p-2 sm:p-4 flex justify-center items-start">
        <div
          className={`transition-all duration-300 shadow-2xl rounded-xl overflow-hidden bg-white ${
            deviceWidthMap[deviceMode] || 'w-full'
          } ${
            deviceMode !== 'desktop'
              ? 'border-4 border-slate-800 rounded-3xl min-h-[680px]'
              : 'min-h-full border border-slate-800'
          }`}
        >
          {profile ? (
            <UniversalStorefrontRenderer
              profile={profile}
              isMobile={deviceMode === 'mobile'}
              activePageId={activePageId}
              onNavigatePage={setActivePageId}
            />
          ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
              <Sparkles className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
              <p className="font-semibold text-sm text-slate-300">Génération de l'aperçu...</p>
              <p className="text-xs text-slate-500 mt-1">Sélectionnez une boutique pour afficher son rendu en direct.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
