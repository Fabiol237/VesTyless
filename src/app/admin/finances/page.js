'use client';
import { useState, useEffect } from 'react';
import { Landmark, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminFinancesPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinanceData() {
      // Simulation ou calcul réel via Supabase
      const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at');
      
      if (orders) {
        const total = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
        const completed = orders.filter(o => o.status === 'completed').length;
        const pending = orders.filter(o => o.status === 'pending').length;
        
        setStats({
          totalRevenue: total,
          monthlyRevenue: total * 0.15, // Exemple de commission 15%
          pendingOrders: pending,
          completedOrders: completed
        });
      }
      setLoading(false);
    }
    loadFinanceData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div></div>;
  }

  return (
    <div className="flex-1 lg:ml-64 p-8 overflow-y-auto min-h-screen bg-gray-50">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="text-wa-teal" /> 
          Gestion des Finances
        </h1>
        <p className="text-slate-500 text-sm mt-1">Suivi des revenus, commissions et transactions de la plateforme.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Volume d'Affaires Total</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalRevenue.toLocaleString()} F</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-wa-teal/10 rounded-xl text-wa-teal"><Wallet size={20} /></div>
            <span className="text-xs font-bold text-wa-teal bg-wa-teal/10 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight size={12} /> Commissions
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenus Plateforme (Est.)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.monthlyRevenue.toLocaleString()} F</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><CreditCard size={20} /></div>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Commandes en attente</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingOrders}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><CheckCircleIcon size={20} /></div>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ventes Terminées</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.completedOrders}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Landmark size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Module de Paiement en cours d'intégration</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">Le système de suivi automatique des commissions par boutique sera disponible dès l'activation de l'API de paiement Stripe ou CinetPay.</p>
      </div>
    </div>
  );
}

function CheckCircleIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
