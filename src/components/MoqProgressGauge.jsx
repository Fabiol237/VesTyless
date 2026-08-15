'use client';

import React from 'react';

/**
 * MoqProgressGauge — Composant Jauge MOQ & Tarifs Grossistes Dégressifs (Inspired by Made-in-China)
 * 
 * @param {number} currentQty - Quantité actuelle sélectionnée ou dans le panier
 * @param {number} moqTier1 - Quantité pour débloquer le 1er palier (ex: 5 pcs)
 * @param {number} moqTier2 - Quantité pour débloquer le 2ème palier (ex: 20 pcs)
 * @param {number} discountTier1 - Pourcentage réduction palier 1 (ex: 15%)
 * @param {number} discountTier2 - Pourcentage réduction palier 2 (ex: 30%)
 * @param {number} basePrice - Prix unitaire standard (ex: 10000 FCFA)
 */
export default function MoqProgressGauge({
  currentQty = 1,
  moqTier1 = 5,
  moqTier2 = 20,
  discountTier1 = 15,
  discountTier2 = 30,
  basePrice = 0,
}) {
  const qty = Math.max(1, currentQty);

  // Calcul du taux de réduction actif
  let activeDiscount = 0;
  let nextTierMoq = moqTier1;
  let nextTierDiscount = discountTier1;
  let progressPercent = Math.min(100, Math.round((qty / moqTier1) * 100));

  if (qty >= moqTier2) {
    activeDiscount = discountTier2;
    nextTierMoq = null;
    progressPercent = 100;
  } else if (qty >= moqTier1) {
    activeDiscount = discountTier1;
    nextTierMoq = moqTier2;
    nextTierDiscount = discountTier2;
    progressPercent = Math.min(100, Math.round(((qty - moqTier1) / (moqTier2 - moqTier1)) * 100));
  }

  const itemsNeeded = nextTierMoq ? nextTierMoq - qty : 0;
  const unitPrice = basePrice ? Math.round(basePrice * (1 - activeDiscount / 100)) : 0;
  const currencyFmt = (val) => new Intl.NumberFormat('fr-FR').format(Number(val || 0)) + ' FCFA';

  return (
    <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-900 text-white rounded-2xl p-4 border border-blue-500/30 shadow-xl space-y-3">
      {/* En-tête Jauge MOQ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h4 className="text-xs font-black uppercase tracking-wider text-blue-200">
            📊 Tarifs Grossiste Dégressifs (MOQ)
          </h4>
        </div>
        {activeDiscount > 0 ? (
          <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
            🎉 -{activeDiscount}% Débloqué !
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-300">
            Détail (1-{moqTier1 - 1} pcs)
          </span>
        )}
      </div>

      {/* Barre de Progression Visuelle */}
      <div className="space-y-1.5">
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Message dynamique de progression */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          {nextTierMoq ? (
            <span>
              Ajoutez <strong className="text-amber-300 font-black">{itemsNeeded} article{itemsNeeded > 1 ? 's' : ''}</strong> pour débloquer <strong className="text-emerald-400 font-black">-{nextTierDiscount}% Grossiste</strong>
            </span>
          ) : (
            <span className="text-emerald-300 font-black">
              🌟 Meilleur Tarif Grossiste VIP Atteint (-{discountTier2}%) !
            </span>
          )}
          <span>{qty} pc{qty > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Grille des 3 Paliers de Prix (Made-in-China style) */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
        
        {/* Palier 1 : Détail */}
        <div className={`p-2 rounded-xl border transition-all ${
          qty < moqTier1
            ? 'bg-blue-600/30 border-blue-400 text-white shadow-md scale-[1.02]'
            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
        }`}>
          <div className="text-[10px] font-bold uppercase">1 - {moqTier1 - 1} pcs</div>
          <div className="text-xs font-extrabold mt-0.5">Détail</div>
          {basePrice > 0 && (
            <div className="text-[11px] font-semibold text-blue-200 mt-0.5">
              {currencyFmt(basePrice)}
            </div>
          )}
        </div>

        {/* Palier 2 : Grossiste Tier 1 */}
        <div className={`p-2 rounded-xl border transition-all ${
          qty >= moqTier1 && qty < moqTier2
            ? 'bg-blue-600/30 border-blue-400 text-white shadow-md scale-[1.02]'
            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
        }`}>
          <div className="text-[10px] font-bold uppercase">{moqTier1} - {moqTier2 - 1} pcs</div>
          <div className="text-xs font-extrabold text-emerald-400 mt-0.5">Gros (-{discountTier1}%)</div>
          {basePrice > 0 && (
            <div className="text-[11px] font-semibold text-emerald-300 mt-0.5">
              {currencyFmt(Math.round(basePrice * (1 - discountTier1 / 100)))}
            </div>
          )}
        </div>

        {/* Palier 3 : Grossiste VIP */}
        <div className={`p-2 rounded-xl border transition-all ${
          qty >= moqTier2
            ? 'bg-blue-600/30 border-blue-400 text-white shadow-md scale-[1.02]'
            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
        }`}>
          <div className="text-[10px] font-bold uppercase">{moqTier2}+ pcs</div>
          <div className="text-xs font-extrabold text-amber-400 mt-0.5">VIP (-{discountTier2}%)</div>
          {basePrice > 0 && (
            <div className="text-[11px] font-semibold text-amber-300 mt-0.5">
              {currencyFmt(Math.round(basePrice * (1 - discountTier2 / 100)))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
