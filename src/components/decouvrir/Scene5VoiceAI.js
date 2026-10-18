'use client';

import React from 'react';

export default function Scene5VoiceAI({ progress = 0 }) {
  const waveActive = progress > 0.2;

  const languages = [
    { name: 'Français', active: progress > 0.2 },
    { name: 'Pidgin', active: progress > 0.5 },
    { name: 'Ewondo', active: progress > 0.7 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-6 max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          Étape 5 sur 8
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 text-white tracking-tight">
          Parle, il comprend
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          Exprime ce que tu cherches à la voix dans ta langue préférée.
        </p>
      </div>

      <div className="relative w-72 sm:w-80 h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 shadow-2xl flex flex-col items-center justify-between">
        <div className="relative flex items-center justify-center my-auto">
          <div
            className={`absolute w-36 h-36 rounded-full border-2 border-emerald-500/30 transition-all duration-700 ${
              waveActive ? 'scale-125 opacity-100' : 'scale-75 opacity-0'
            }`}
          />
          <div
            className={`absolute w-48 h-48 rounded-full border border-emerald-400/20 transition-all duration-1000 ${
              waveActive ? 'scale-125 opacity-100' : 'scale-50 opacity-0'
            }`}
          />

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>

        <div className="w-full flex justify-center space-x-2">
          {languages.map((lang, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                lang.active
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {lang.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
