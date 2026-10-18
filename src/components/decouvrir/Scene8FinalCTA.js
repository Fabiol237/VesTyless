'use client';

import React from 'react';
import Link from 'next/link';

export default function Scene8FinalCTA({ progress = 0 }) {
  const ready = progress > 0.3;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 8 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Prêt à lancer ton commerce ?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Rejoins des centaines de vendeurs et démarre ta boutique en moins de 2 minutes.
        </p>
      </div>

      <div className="relative w-72 sm:w-80 h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 shadow-2xl flex flex-col items-center justify-around">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-emerald-400/40 p-2 flex items-center justify-center shadow-xl mb-3">
            <img src="/vestyle-logo.png" alt="VesTyle Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-2xl font-black text-white tracking-wider">VesTyle</p>
          <p className="text-xs text-emerald-400 font-medium mt-1">L&apos;expérience boutique nouvelle génération</p>
        </div>

        <div className="w-full">
          <Link
            href="/signup"
            className={`w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold text-base shadow-xl hover:opacity-95 transition-all duration-300 flex items-center justify-center space-x-2 ${
              ready ? 'scale-105 shadow-emerald-500/30' : 'scale-100'
            }`}
          >
            <span>Crée ta boutique</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <p className="text-[11px] text-slate-400 mt-2">100% gratuit pour démarrer • Sans carte bancaire</p>
        </div>
      </div>
    </div>
  );
}
