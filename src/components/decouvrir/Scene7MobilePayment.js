'use client';

import React from 'react';

export default function Scene7MobilePayment({ progress = 0 }) {
  const highlightMtn = progress > 0.25;
  const highlightOrange = progress > 0.6;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 7 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Paie avec ton Mobile Money
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Règlement rapide et sécurisé sans carte bancaire ni démarche complexe.
        </p>
      </div>

      <div className="relative w-72 sm:w-80 h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 shadow-2xl flex flex-col justify-between">
        <div className="text-left">
          <p className="text-xs font-semibold text-slate-400">Moyen de paiement local</p>
          <p className="text-lg font-bold text-white mt-1">Validation en 1 clic</p>
        </div>

        <div className="space-y-4 my-auto">
          <div
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
              highlightMtn
                ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 border-slate-700 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-extrabold text-amber-300 text-sm sm:text-base tracking-wide">
                MTN MoMo
              </span>
            </div>
            <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">Actif</span>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
              highlightOrange
                ? 'bg-orange-500/20 border-orange-400 scale-105 shadow-lg shadow-orange-500/20'
                : 'bg-slate-800/60 border-slate-700 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-extrabold text-orange-400 text-sm sm:text-base tracking-wide">
                Orange Money
              </span>
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Actif</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-emerald-400 text-xs font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Transactions 100% sécurisées</span>
        </div>
      </div>
    </div>
  );
}
