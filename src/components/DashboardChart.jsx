'use client';
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-xl border border-white/5">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
        <p className="text-sm font-black">{currencyFormatter.format(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardChart({ data }) {
  // Simuler des données si vides (L M M J V S D)
  const rawData = data || [40, 70, 45, 90, 65, 80, 50];
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const chartData = useMemo(() => {
    return rawData.map((val, i) => ({
      name: days[i],
      value: val * 1000 // Facteur d'échelle pour l'exemple
    }));
  }, [rawData]);

  return (
    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-6 flex flex-col h-full overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Activité Hebdomadaire</h3>
        <div className="w-8 h-8 bg-wa-chat rounded-xl flex items-center justify-center text-wa-teal">
           <BarChart2 size={16} />
        </div>
      </div>

      <div className="flex-1 min-h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#f8fafc', radius: 10 }} 
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 6, 6]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === new Date().getDay() - 1 ? '#128C7E' : '#E8F5F3'} 
                />
              ))}
            </Bar>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 900 }}
              interval={0}
              dy={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-50">
         <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest text-center italic">Cycle de performance 7j</p>
      </div>
    </div>
  );
}
