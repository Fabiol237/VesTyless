'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
});

export default function PremiumChart({ data = [], labels = [] }) {
  const [hovered, setHovered] = useState(null);

  const points = data.length > 0 ? data : [0];
  const displayLabels = labels.length === points.length ? labels : points.map((_, i) => `J${i + 1}`);

  const width = 1000;
  const height = 250;
  const padding = 40;
  const maxVal = Math.max(...points, 1);

  const coords = useMemo(() => {
    if (points.length === 1) {
      return [{ x: width / 2, y: height / 2 }];
    }
    return points.map((val, i) => ({
      x: (i * (width - padding * 2)) / (points.length - 1) + padding,
      y: height - (val / maxVal) * (height - padding * 2) - padding,
    }));
  }, [points, maxVal]);

  const linePath = useMemo(() => {
    if (coords.length < 2) return `M ${coords[0].x} ${coords[0].y}`;
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

  const areaPath = coords.length < 2
    ? ''
    : `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  // Choose which labels to display (max 8 visible)
  const visibleLabelIndices = useMemo(() => {
    if (displayLabels.length <= 8) return displayLabels.map((_, i) => i);
    const step = Math.ceil(displayLabels.length / 7);
    const indices = [];
    for (let i = 0; i < displayLabels.length; i += step) indices.push(i);
    if (indices[indices.length - 1] !== displayLabels.length - 1) {
      indices.push(displayLabels.length - 1);
    }
    return indices;
  }, [displayLabels]);

  return (
    <div className="w-full bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tendance des ventes</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {points.length} point{points.length > 1 ? 's' : ''} de données
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-wa-teal rounded-full"></div>
          <span className="text-[10px] font-black text-slate-900 uppercase">Revenus (FCFA)</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered !== null && (
        <div className="mb-3 text-center">
          <span className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg">
            <span className="opacity-60">{displayLabels[hovered]}</span>
            <span>{currencyFormatter.format(points[hovered])}</span>
          </span>
        </div>
      )}

      <div className="relative h-[220px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padding} y1={height - padding - p * (height - padding * 2)}
              x2={width - padding} y2={height - padding - p * (height - padding * 2)}
              stroke="#f1f5f9" strokeWidth="1"
            />
          ))}

          {/* Y-axis value labels */}
          {[0, 0.5, 1].map((p) => (
            <text
              key={p}
              x={padding - 6}
              y={height - padding - p * (height - padding * 2) + 4}
              textAnchor="end"
              fontSize="18"
              fill="#94a3b8"
              fontWeight="700"
            >
              {p === 0 ? '0' : p === 0.5 ? `${Math.round(maxVal / 2 / 1000)}k` : `${Math.round(maxVal / 1000)}k`}
            </text>
          ))}

          <defs>
            <linearGradient id="chartGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#128C7E" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#128C7E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#chartGradient2)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          )}

          <motion.path
            d={linePath}
            fill="none"
            stroke="#128C7E"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />

          {coords.map((c, i) => (
            <motion.circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={hovered === i ? 10 : 6}
              fill={hovered === i ? '#128C7E' : 'white'}
              stroke="#128C7E"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + i * 0.05 }}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ transition: 'r 0.15s, fill 0.15s' }}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="relative mt-3 h-5">
        {visibleLabelIndices.map((idx) => {
          const leftPct = coords[idx]
            ? ((coords[idx].x - padding) / (width - padding * 2)) * 100
            : 0;
          return (
            <span
              key={idx}
              className="absolute -translate-x-1/2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap"
              style={{ left: `${leftPct}%` }}
            >
              {displayLabels[idx]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
