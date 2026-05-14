'use client';
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, defs, linearGradient, stop 
} from 'recharts';
import { motion } from 'framer-motion';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-wa-teal uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-xl font-black text-white tracking-tight">
          {currencyFormatter.format(payload[0].value)}
        </p>
        <div className="mt-2 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-wa-teal animate-pulse" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction Certifiée</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function PremiumChart({ data = [], labels = [] }) {
  // Transformation des données pour Recharts
  const chartData = useMemo(() => {
    return data.map((val, i) => ({
      name: labels[i] || `J${i + 1}`,
      revenue: val
    }));
  }, [data, labels]);

  const maxVal = Math.max(...data, 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-[40px] p-8 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2 h-2 bg-wa-teal rounded-full animate-pulse" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Performance Analystique</h3>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tendance des Flux</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Maximum</p>
             <p className="text-sm font-black text-slate-900">{currencyFormatter.format(maxVal)}</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-2.5 h-2.5 bg-wa-teal rounded-full shadow-[0_0_10px_rgba(18,140,126,0.5)]" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Revenus</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#128C7E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#128C7E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={15}
              interval="preserveStartEnd"
            />
            <YAxis 
              hide={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              width={40}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#128C7E', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#128C7E" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={2000}
              activeDot={{ r: 8, fill: '#128C7E', stroke: '#fff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Données synchronisées en temps réel via Vestyle Logistics</p>
         <div className="flex gap-2">
            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-wa-teal/20" />)}
         </div>
      </div>
    </motion.div>
  );
}
