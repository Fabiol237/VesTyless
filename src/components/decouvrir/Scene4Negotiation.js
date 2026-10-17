'use client';

import React from 'react';

export default function Scene4Negotiation({ progress = 0 }) {
  const step1 = progress > 0.15;
  const step2 = progress > 0.35;
  const step3 = progress > 0.55;
  const step4 = progress > 0.75;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 4 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Négocie comme dans une discussion
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Propose ton prix directement et conclue une affaire gagnant-gagnant.
        </p>
      </div>

      <div className="relative w-72 sm:w-80 h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="w-full bg-slate-800 text-white p-2.5 rounded-2xl flex items-center justify-between shadow border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center font-bold text-xs">
              VS
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight text-white">Vendeur VesTyle</p>
              <p className="text-[10px] text-emerald-300">En ligne</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">WhatsApp</span>
        </div>

        <div className="flex-1 my-3 space-y-2 flex flex-col justify-end text-left">
          <div
            className={`self-start max-w-[80%] bg-slate-800 text-white p-2.5 rounded-2xl rounded-tl-none shadow-sm text-xs border border-slate-700 transition-all duration-300 ${
              step1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Bonjour ! Tu es intéressé par la chemise ?
          </div>

          <div
            className={`self-end max-w-[80%] bg-emerald-800 text-emerald-50 p-2.5 rounded-2xl rounded-tr-none shadow-sm text-xs border border-emerald-700 transition-all duration-300 ${
              step2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Oui, je te propose un bon prix direct !
          </div>

          <div
            className={`self-start max-w-[80%] bg-slate-800 text-white p-2.5 rounded-2xl rounded-tl-none shadow-sm text-xs border border-slate-700 transition-all duration-300 ${
              step3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            D’accord, dis-moi ton offre !
          </div>

          <div
            className={`self-center bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-full shadow-lg text-xs tracking-wide transition-all duration-300 ${
              step4 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            ✓ Offre acceptée !
          </div>
        </div>
      </div>
    </div>
  );
}
