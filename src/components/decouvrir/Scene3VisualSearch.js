'use client';

import React from 'react';

export default function Scene3VisualSearch({ progress = 0 }) {
  const scanLinePos = Math.min(Math.max(progress * 100, 0), 100);
  const showResults = progress > 0.4;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 3 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Une photo, et tu trouves
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Scanne n’importe quel article et retrouve immédiatement les pépites similaires.
        </p>
      </div>

      <div className="relative w-72 h-80 sm:w-80 sm:h-96 bg-slate-900 rounded-3xl p-4 border-2 border-emerald-500/40 shadow-2xl flex flex-col items-center justify-between overflow-hidden">
        <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-slate-800 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
          <svg className="w-20 h-20 text-amber-400 opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4V4a2 2 0 00-2-2zm-2 4V4h4v2h-4z" />
          </svg>

          <div
            className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399]"
            style={{ top: `${scanLinePos}%`, transition: 'top 0.1s linear' }}
          />
        </div>

        <div className="w-full flex-1 mt-3 flex flex-col justify-end space-y-2">
          <p className="text-xs text-emerald-400 text-left font-semibold">
            {showResults ? '✓ Produits similaires détectés' : 'Analyse de l’image...'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2 rounded-xl bg-slate-800 border border-emerald-500/30 transition-all duration-300 ${
                showResults ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-2'
              }`}
            >
              <div className="w-full h-10 rounded-lg bg-amber-500/30 mb-1 flex items-center justify-center text-xs text-amber-300">
                Style A
              </div>
              <span className="text-[10px] text-slate-300">Correspondance 98%</span>
            </div>

            <div
              className={`p-2 rounded-xl bg-slate-800 border border-emerald-500/30 transition-all duration-300 ${
                showResults ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-2'
              }`}
            >
              <div className="w-full h-10 rounded-lg bg-emerald-500/30 mb-1 flex items-center justify-center text-xs text-emerald-300">
                Style B
              </div>
              <span className="text-[10px] text-slate-300">Correspondance 94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
