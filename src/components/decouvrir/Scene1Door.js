'use client';

import React, { useState } from 'react';

export default function Scene1Door({ progress = 0 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Open doors based on progress (0 to 1)
  const angle = Math.min(Math.max(progress * 110, 0), 110);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 1 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Ta boutique, dans ta poche
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Pousse la porte de ton nouveau commerce 100% mobile et accessible partout.
        </p>
      </div>

      {/* 3D Door Container */}
      <div
        className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl bg-slate-900 shadow-2xl p-3 border-4 border-emerald-500/30 flex items-center justify-center overflow-hidden"
        style={{
          perspective: '1000px',
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Interior Boutique Scene behind doors */}
        <div className="absolute inset-2 bg-gradient-to-b from-emerald-900/40 via-emerald-950 to-slate-900 rounded-xl flex flex-col items-center justify-center p-4 text-emerald-100">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-3 animate-pulse">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="font-bold text-lg text-white">Bienvenue chez VesTyle</p>
          <p className="text-xs text-emerald-300/80 mt-1">Prêt pour tes premières ventes</p>
        </div>

        {/* Left Door */}
        <div
          className="absolute left-2 top-2 bottom-2 w-[calc(50%-8px)] bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-l-lg border-r border-emerald-800 shadow-lg flex items-center justify-end pr-2 z-10"
          style={{
            transformOrigin: 'left center',
            transform: `rotateY(${-angle}deg)`,
            transition: 'transform 0.1s linear',
          }}
        >
          <div className="w-3 h-8 bg-amber-400 rounded-full border border-amber-600 shadow" />
        </div>

        {/* Right Door */}
        <div
          className="absolute right-2 top-2 bottom-2 w-[calc(50%-8px)] bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-r-lg border-l border-emerald-800 shadow-lg flex items-center justify-start pl-2 z-10"
          style={{
            transformOrigin: 'right center',
            transform: `rotateY(${angle}deg)`,
            transition: 'transform 0.1s linear',
          }}
        >
          <div className="w-3 h-8 bg-amber-400 rounded-full border border-amber-600 shadow" />
        </div>
      </div>
    </div>
  );
}
