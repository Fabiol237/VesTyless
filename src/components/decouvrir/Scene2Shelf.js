'use client';

import React from 'react';

export default function Scene2Shelf({ progress = 0 }) {
  const shiftFront = (progress - 0.5) * 40;
  const shiftMid = (progress - 0.5) * -20;
  const shiftBack = (progress - 0.5) * 15;

  const cards = [
    { title: 'Robe Élégante', badge: 'Tendance', color: 'from-amber-400 to-orange-500', depth: shiftFront, z: 20 },
    { title: 'Veste en Jean', badge: 'Populaire', color: 'from-emerald-500 to-teal-600', depth: shiftMid, z: 10 },
    { title: 'Baskets Style', badge: 'Nouveau', color: 'from-indigo-500 to-blue-600', depth: shiftBack, z: 0 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 2 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Entre, regarde
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Découvre une vitrine fluide avec un effet de profondeur naturelle.
        </p>
      </div>

      <div
        className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-center justify-center"
        style={{ perspective: '800px' }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`absolute w-48 sm:w-56 h-36 sm:h-40 rounded-2xl p-4 bg-gradient-to-br ${card.color} text-white shadow-xl border border-white/20 flex flex-col justify-between`}
            style={{
              transform: `translate3d(${idx * 12 - 12}px, ${idx * 40 - 40 + card.depth}px, ${card.z}px) rotate(${idx * 4 - 4}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full font-medium">
                {card.badge}
              </span>
              <div className="w-3 h-3 rounded-full bg-white/40" />
            </div>

            <div className="text-left">
              <p className="font-extrabold text-lg sm:text-xl">{card.title}</p>
              <div className="w-12 h-1 bg-white/60 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
