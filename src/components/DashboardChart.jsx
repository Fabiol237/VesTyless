'use client';
import { BarChart2 } from 'lucide-react';

export default function DashboardChart({ data }) {
  // Simuler des données si vides (L M M J V S D)
  const chartData = data || [40, 70, 45, 90, 65, 80, 50];

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Activité 7j</h3>
        <BarChart2 size={16} className="text-wa-teal" />
      </div>
      <div className="flex items-end justify-between gap-1 h-32 px-2">
        {chartData.map((h, i) => (
          <div key={i} className="flex-1 bg-wa-chat rounded-t-lg relative group">
            <div 
              className="absolute bottom-0 w-full bg-wa-teal rounded-t-lg transition-all duration-700 ease-out" 
              style={{ height: `${h}%` }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
              {h * 1000} F
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center text-neutral-400 mt-3 font-bold">L M M J V S D</p>
    </div>
  );
}
