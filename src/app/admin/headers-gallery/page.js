'use client';

/**
 * VesTyle V1 — Notice d'Architecture & Redirection
 * ─────────────────────────────────────────────────────────────────────────────
 * Cette page de galerie indépendante (100 headers isolés) est DÉPRÉCIÉE et ARCHIVÉE.
 * 
 * RÈGLE ARCHITECTURALE VESTYLE V1 :
 *  ACCOUNT → SITE → DOMAIN → CATEGORY → DESIGN → PAGES → SECTIONS → COMPONENTS → DATA
 * 
 * Dans VesTyle V1, les headers ne sont PAS des entités autonomes avec un moteur de rendu
 * séparé. Un Header est une Section intégrée dans le contrat DesignDefinition du Design concerné,
 * et son rendu est exclusivement assuré par le CanonicalStorefrontRenderer.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export default function DeprecatedHeadersGalleryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">Architecture VesTyle V1</span>
            <h1 className="text-xl font-black text-white">Galerie Indépendante Dépréciée</h1>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 mb-8 leading-relaxed">
          <p>
            Conformément aux règles fondamentales de l'architecture <strong className="text-white">VesTyle V1</strong>, les en-têtes (headers) ne possèdent pas de moteur de rendu parallèle ni de galerie déconnectée.
          </p>
          
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-amber-300">
            ACCOUNT → SITE → DOMAIN → CATEGORY → DESIGN → PAGES → SECTIONS → COMPONENTS → DATA
          </div>

          <p>
            Chaque Header est une <strong className="text-white">Section déclarative</strong> au sein d'un <strong className="text-white">DesignDefinition</strong> multi-pages complet, et son affichage est pris en charge de manière universelle par l'unique <strong className="text-amber-400">CanonicalStorefrontRenderer</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 block mb-1">Source de vérité :</span>
              <span className="font-semibold text-white">DesignDefinition Contract v3.0</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 block mb-1">Moteur d'affichage :</span>
              <span className="font-semibold text-emerald-400">CanonicalStorefrontRenderer</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all"
          >
            <ArrowLeft size={16} />
            Retour à l'Admin
          </Link>
          <Link
            href="/mes-sites"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition-all shadow-lg shadow-amber-500/20"
          >
            <Layers size={16} />
            Accéder à Mes Sites & Designs
          </Link>
        </div>
      </div>
    </div>
  );
}
