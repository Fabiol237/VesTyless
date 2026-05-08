'use client';
import { useState, useEffect } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  ShieldCheck, 
  Zap,
  Globe,
  PieChart,
  DollarSign
} from 'lucide-react';
import { getFinanceStatsAction } from '../actions';
import { motion } from 'framer-motion';

export default function AdminFinancesPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformRevenue: 0,
    revenueTrend: "0",
    commissionRate: 15,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinanceData() {
      const data = await getFinanceStatsAction();
      setStats(data);
      setLoading(false);
    }
    loadFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-wa-teal/20 border-t-wa-teal rounded-full"
        />
      </div>
    );
  }

  const cards = [
    { 
      title: "Volume d'Affaires", 
      value: `${stats.totalRevenue.toLocaleString()} F`, 
      icon: TrendingUp, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      trend: `${stats.revenueTrend}%` 
    },
    { 
      title: `Commissions (${stats.commissionRate}%)`, 
      value: `${stats.platformRevenue.toLocaleString()} F`, 
      icon: Wallet, 
      color: "text-wa-teal", 
      bg: "bg-teal-50", 
      trend: "ACTIF" 
    },
    { 
      title: "Flux en Attente", 
      value: stats.pendingOrders, 
      icon: CreditCard, 
      color: "text-amber-600", 
      bg: "bg-amber-50", 
      trend: "LATENCY" 
    },
    { 
      title: "Transactions OK", 
      value: stats.completedOrders, 
      icon: ShieldCheck, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      trend: "SAFE" 
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-wa-teal font-black text-xs uppercase tracking-[0.3em] mb-2"
          >
            <Landmark size={14} fill="currentColor" /> Economic Dashboard
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Market <span className="text-slate-300">Economy.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-wa-teal text-black px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-wa-teal/20 uppercase tracking-widest">
             Générer Rapport <PieChart size={16} className="inline ml-2" />
          </button>
        </div>
      </header>

      {/* Finance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-start justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.bg} ${card.color}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</p>
            <h3 className="text-3xl font-black text-white">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Centerpiece: Economic Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-wa-teal/20 via-transparent to-transparent border border-wa-teal/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <TrendingUp size={200} className="text-wa-teal" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-wa-teal flex items-center justify-center text-black">
                     <Zap size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Santé Économique du Réseau</h2>
               </div>
               <p className="text-neutral-400 text-lg leading-relaxed max-w-xl font-medium">
                  Le volume de transactions actuel est stable. Les commissions générées par le réseau local permettent de couvrir les frais d'infrastructure et d'IA.
               </p>
               <div className="grid grid-cols-3 gap-10 mt-12">
                  <div>
                     <p className="text-neutral-600 text-[10px] font-black uppercase mb-1">Efficacité</p>
                     <p className="text-2xl font-black text-white">98.4%</p>
                  </div>
                  <div>
                     <p className="text-neutral-600 text-[10px] font-black uppercase mb-1">Latence Flux</p>
                     <p className="text-2xl font-black text-white">120ms</p>
                  </div>
                  <div>
                     <p className="text-neutral-600 text-[10px] font-black uppercase mb-1">Rétention</p>
                     <p className="text-2xl font-black text-white">45.2%</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-6">
               <DollarSign size={40} className="text-neutral-700" />
            </div>
            <h3 className="text-xl font-black text-white mb-3">Module de Paiement Automatique</h3>
            <p className="text-sm text-neutral-500 font-bold mb-8">
               Le système de versement automatique vers Mobile Money (Orange/MTN) est en phase de test sandbox.
            </p>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "75%" }}
                 transition={{ duration: 2, delay: 0.5 }}
                 className="h-full bg-wa-teal" 
               />
            </div>
            <p className="text-[10px] text-neutral-600 font-black mt-3 uppercase tracking-widest">75% CONFIGURÉ</p>
         </div>
      </div>

      {/* Global Ledger Placeholder */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-8 bg-blue-500 rounded-full" />
           <h2 className="text-2xl font-black text-white tracking-tight">Grand Livre des Opérations</h2>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 text-center border-dashed">
           <Globe size={48} className="mx-auto text-neutral-800 mb-4" />
           <p className="text-neutral-500 font-black text-sm uppercase tracking-widest">Aucune anomalie de flux détectée dans le réseau global</p>
        </div>
      </section>
    </div>
  );
}
