'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function PremiumChart({ data = [] }) {
  // On s'assure d'avoir 7 points (L M M J V S D)
  // Si les données sont vides, on met des zéros
  const points = data.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0];
  
  // Paramètres du graph
  const width = 1000;
  const height = 250;
  const padding = 40;
  const maxVal = Math.max(...points, 1);

  // Calcul des coordonnées des points
  const coords = useMemo(() => {
    return points.map((val, i) => ({
      x: (i * (width - padding * 2)) / (points.length - 1) + padding,
      y: height - (val / maxVal) * (height - padding * 2) - padding
    }));
  }, [points, maxVal]);

  // Génération de la ligne (Courbe de Bézier fluide)
  const linePath = useMemo(() => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      d += ` C ${cp1x} ${curr.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [coords]);

  // Chemin pour le remplissage (dégradé)
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="w-full bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tendance des ventes</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Performance sur les 7 derniers jours</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-wa-teal rounded-full"></div>
          <span className="text-[10px] font-black text-slate-900 uppercase">Revenus (FCFA)</span>
        </div>
      </div>

      <div className="relative h-[250px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grille horizontale */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line 
              key={p} 
              x1={padding} y1={height - padding - p * (height - padding * 2)} 
              x2={width - padding} y2={height - padding - p * (height - padding * 2)} 
              stroke="#f1f5f9" strokeWidth="1" 
            />
          ))}

          {/* Dégradé sous la courbe */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#128C7E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#128C7E" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <motion.path 
            d={areaPath} 
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* La ligne de la courbe */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#128C7E"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Points sur la courbe */}
          {coords.map((c, i) => (
            <motion.circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="6"
              fill="white"
              stroke="#128C7E"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              whileHover={{ scale: 1.5, strokeWidth: 5 }}
              className="cursor-pointer"
            />
          ))}
        </svg>
      </div>

      {/* Axe X - Jours */}
      <div className="flex justify-between px-6 mt-4">
        {days.map((day, i) => (
          <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}
