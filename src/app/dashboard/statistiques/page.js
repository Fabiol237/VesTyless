'use client';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, Eye, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import PremiumChart from '@/components/PremiumChart';

export default function StoreStatistics() {
  const { store } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ orders: [], products: [], analytics: [] });

  useEffect(() => {
    async function loadStats() {
      if (!store?.id) return;
      const [ordersRes, productsRes, analyticsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('store_id', store.id),
        supabase.from('products').select('*').eq('store_id', store.id),
        supabase.rpc('get_store_weekly_analytics', { store_id_param: store.id })
      ]);
      setData({
        orders: ordersRes.data || [],
        products: productsRes.data || [],
        analytics: analyticsRes.data || []
      });
      setLoading(false);
    }
    loadStats();
  }, [store?.id]);

  const stats = useMemo(() => {
    const totalRevenue = data.orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0);
    const totalOrders = data.orders.length;
    const deliveredOrders = data.orders.filter(o => o.status === 'delivered').length;
    const totalProducts = data.products.length;
    const totalViews = data.analytics.reduce((s, a) => s + Number(a.total_views || 0), 0);
    const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : 0;

    return { totalRevenue, totalOrders, deliveredOrders, totalProducts, totalViews, conversionRate };
  }, [data]);

  const chartData = useMemo(() => {
    // Generate simple last 7 days chart data
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyRevenue = last7Days.map(date => {
      return data.orders
        .filter(o => o.status === 'delivered' && o.created_at.startsWith(date))
        .reduce((s, o) => s + Number(o.total_amount), 0);
    });

    return {
      labels: last7Days.map(d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' })),
      data: dailyRevenue
    };
  }, [data.orders]);

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Chargement des statistiques...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-wa-teal font-bold text-sm inline-flex items-center gap-2 hover:underline mb-2">
            <ArrowLeft size={16} /> Retour au Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Statistiques Détaillées</h1>
          <p className="text-slate-500 font-medium">Analysez les performances de votre boutique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-wa-chat text-wa-teal rounded-xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Revenus Totaux</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.totalRevenue)}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
            <Package size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Commandes (Livrées / Totales)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.deliveredOrders} <span className="text-slate-400 text-lg">/ {stats.totalOrders}</span></p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4">
            <Eye size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vues (7 jours)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalViews}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Taux de conversion</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.conversionRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <BarChart2 size={20} className="text-wa-teal" /> Évolution des Revenus (7 derniers jours)
        </h2>
        <div className="h-[400px]">
          <PremiumChart labels={chartData.labels} data={chartData.data} />
        </div>
      </div>
    </div>
  );
}
