'use client';

import React from 'react';

export default function Scene6GroupBuy({ progress = 0 }) {
  const showAvatar2 = progress > 0.25;
  const showAvatar3 = progress > 0.5;
  const priceDrop = progress > 0.4;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 6 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Achète à plusieurs, profite des ventes flash
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Rejoins le groupe d’achat pour débloquer le prix le plus bas possible.
        </p>
      </div>

      <div className="relative w-72 sm:w-80 h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-3 flex justify-between items-center shadow">
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-100">Vente Flash</p>
            <p className="font-extrabold text-sm">Achat Groupé</p>
          </div>
          <div className="bg-black/30 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
            00 : 14 : 59
          </div>
        </div>

        <div className="my-2 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-300">Acheteurs en ligne :</span>
          <div className="flex -space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div
              className={`w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${
                showAvatar2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              B
            </div>
            <div
              className={`w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${
                showAvatar3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              C
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-300">Prix unitaire :</span>
          <div className="text-right">
            <span
              className={`text-xs line-through mr-2 transition-colors duration-300 ${
                priceDrop ? 'text-red-400 font-bold' : 'text-slate-500'
              }`}
            >
              Prix Normal
            </span>
            <span
              className={`text-sm font-extrabold transition-all duration-300 ${
                priceDrop ? 'text-emerald-400 scale-110 inline-block' : 'text-slate-200'
              }`}
            >
              Prix Réduit
            </span>
          </div>
        </div>

        <div className="relative h-20 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-around">
          <svg className="absolute inset-0 w-full h-full opacity-20 text-emerald-500" viewBox="0 0 100 50">
            <path d="M10,25 Q30,5 50,25 T90,25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <div className="z-10 flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
            <svg className="w-4 h-4 text-emerald-400 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Livraison regroupée</span>
          </div>
        </div>
      </div>
    </div>
  );
}
