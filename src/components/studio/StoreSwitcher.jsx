'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Store, ChevronDown, Plus, Check, ExternalLink, Sparkles } from 'lucide-react';
import { businessTypeRegistry } from '@/lib/business-types/BusinessTypeRegistry';

export default function StoreSwitcher() {
  const { store, stores, activeStoreId, switchStore } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!store && (!stores || stores.length === 0)) {
    return (
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
      >
        <Plus className="w-4 h-4" />
        Créer ma première boutique
      </Link>
    );
  }

  const currentType = businessTypeRegistry.get(store?.business_type);
  const typeLabel = currentType?.label || store?.business_type || 'Boutique';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 text-white text-xs sm:text-sm font-medium transition shadow-sm max-w-[190px] sm:max-w-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
          {store?.name ? store.name.charAt(0).toUpperCase() : <Store className="w-3.5 h-3.5" />}
        </div>
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[160px]">
              {store?.name || 'Ma Boutique'}
            </span>
            <span className="hidden xs:inline text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              {typeLabel}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[90px] sm:max-w-[140px]">
            {store?.slug ? `/${store.slug}` : 'Non configuré'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 origin-top-left rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mes Boutiques ({stores?.length || 1})</p>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60">
            {(stores || [store]).map((s) => {
              const isActive = s.id === (activeStoreId || store?.id);
              const bType = businessTypeRegistry.get(s.business_type);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    switchStore(s.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-left transition hover:bg-slate-800/70 ${
                    isActive ? 'bg-emerald-950/30 text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {s.name ? s.name.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-xs truncate text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {bType?.label || s.business_type || 'Général'} • /{s.slug}
                      </p>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/90 flex flex-col gap-1">
            <Link
              href="/mes-sites"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-950/40 transition"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mes Sites & Designs</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Gérer</span>
            </Link>

            <Link
              href="/creer-mon-site"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              Créer un nouveau site
            </Link>

            {store?.slug && (
              <a
                href={`/boutique/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
              >
                <span>Visiter la vitrine active</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
