'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Store, ShoppingCart, Users, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadAdminStats() {
      const [storesRes, ordersRes, productsRes, usersRes] = await Promise.all([
        supabase.from('stores').select('id, verified'),
        supabase.from('orders').select('total_amount, status'),
        supabase.from('products').select('id'),
        supabase.from('profiles').select('id')
      ]);

      const stores = storesRes.data || [];
      const orders = ordersRes.data || [];
      
      setStats({
        totalStores: stores.length,
        verifiedStores: stores.filter(s => s.verified).length,
        totalOrders: orders.length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0),
        totalProducts: productsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0
      });
    }
    loadAdminStats();
  }, []);

  if (!stats) return <div className="p-10 text-center text-slate-500 font-bold">Analyse des données globales...</div>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-wa-teal font-bold text-sm inline-flex items-center gap-2 hover:underline mb-4">
          <ArrowLeft size={16} /> Retour au Hub
        </Link>
        <h1 className="text-4xl font-black text-slate-900">Rapport Global</h1>
        <p className="text-slate-500 font-medium">Statistiques complètes de la plateforme VESTYLE.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={28} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Volume d'Affaires Global</p>
          <p className="text-4xl font-black text-slate-900 mt-2">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Store size={28} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Boutiques (Vérifiées / Totales)</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.verifiedStores} <span className="text-slate-400 text-2xl">/ {stats.totalStores}</span></p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart size={28} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Commandes (Livrées / Totales)</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.deliveredOrders} <span className="text-slate-400 text-2xl">/ {stats.totalOrders}</span></p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
            <BarChart2 size={28} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Produits Listés</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.totalProducts}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <Users size={28} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Utilisateurs Inscrits</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
