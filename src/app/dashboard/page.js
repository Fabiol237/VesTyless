'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import BackNavigation from '@/components/BackNavigation';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp, ShoppingCart, AlertTriangle, CheckCircle,
  Bell, Package, Plus, Clock, Zap, Truck, XCircle,
  Calendar, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumChart from '@/components/PremiumChart';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
});
function formatAmount(value) {
  const amount = Number(value || 0);
  return currencyFormatter.format(Number.isNaN(amount) ? 0 : amount);
}
function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERIOD CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PERIODS = [
  { id: '7d', label: '7 jours', days: 7, groupBy: 'day' },
  { id: '30d', label: '30 jours', days: 30, groupBy: 'day' },
  { id: '90d', label: '3 mois', days: 90, groupBy: 'week' },
  { id: '6m', label: '6 mois', days: 182, groupBy: 'week' },
  { id: '1y', label: '1 an', days: 365, groupBy: 'month' },
  { id: '2y', label: '2 ans', days: 730, groupBy: 'month' },
  { id: '3y', label: '3 ans', days: 1095, groupBy: 'month' },
];

function buildChartData(orders, period) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - period.days);

  const filtered = orders.filter(o => new Date(o.created_at) >= start && o.status === 'delivered');

  if (period.groupBy === 'day') {
    // One bucket per day
    const buckets = [];
    for (let i = period.days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const total = filtered
        .filter(o => o.created_at.startsWith(key))
        .reduce((s, o) => s + Number(o.total_amount || 0), 0);
      buckets.push({ label, total });
    }
    return buckets;
  }

  if (period.groupBy === 'week') {
    // One bucket per ISO week
    const map = new Map();
    filtered.forEach(o => {
      const d = new Date(o.created_at);
      // Get Monday of this week
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + Number(o.total_amount || 0));
    });
    // Generate all weeks
    const buckets = [];
    const cursor = new Date(start);
    // Move to Monday of start week
    cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    while (cursor <= now) {
      const key = cursor.toISOString().split('T')[0];
      const label = cursor.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      buckets.push({ label, total: map.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 7);
    }
    return buckets;
  }

  // month
  const map = new Map();
  filtered.forEach(o => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + Number(o.total_amount || 0));
  });
  const buckets = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    const label = cursor.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    buckets.push({ label, total: map.get(key) || 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const { loading: authLoading, store } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [livreur, setLivreur] = useState(null);
  const [deliveryCount, setDeliveryCount] = useState(0);

  const storeId = store?.id;

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!storeId) { setDashboardLoading(false); return; }
    if (!isSilent) setDashboardLoading(true);

    try {
      // Optimized: Fetch only last 90 days by default (covers 7d, 30d, 90d filters)
      const since = new Date();
      since.setDate(since.getDate() - 90);

      const [productsRes, ordersRes, notifsRes, analyticsRes] = await Promise.all([
        supabase.from('products').select('id, name, price, image_url, stock_quantity, created_at').eq('store_id', storeId).order('created_at', { ascending: false }),
        supabase.from('orders').select('id, created_at, status, total_amount, customer_name, customer_phone')
          .eq('store_id', storeId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
        supabase.rpc('get_store_weekly_analytics', { store_id_param: storeId })
      ]);

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setNotifications(notifsRes.data || []);
      setAnalytics(analyticsRes.data || []);

      // Check if user is also a livreur
      const { data: liv } = await supabase.from('livreurs').select('id').eq('user_id', store.owner_id).maybeSingle();
      if (liv) {
        setLivreur(liv);
        const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('livreur_id', liv.id)
          .not('status', 'in', '("delivered","cancelled")');
        setDeliveryCount(count || 0);
      }
    } catch (err) {
      console.error('Dashboard Load Error:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, [storeId, store?.owner_id]);

  useEffect(() => {
    if (!authLoading && storeId) {
      loadDashboardData();

      // REAL-TIME: Throttled refresh to avoid infinite loops and UI lag
      let timeout;
      const channel = supabase
        .channel(`dashboard-rt-${storeId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => loadDashboardData(true), 1000); // Silent refresh after 1s stability
        })
        .subscribe();

      return () => {
        clearTimeout(timeout);
        supabase.removeChannel(channel);
      };
    }
  }, [authLoading, storeId, loadDashboardData]);

  // Quick stats for the CURRENT period
  const stats = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - selectedPeriod.days);

    const periodOrders = orders.filter(o => new Date(o.created_at) >= start);

    // SYNC: Only count DELIVERED orders as Revenue (Actual Sales)
    const revenue = periodOrders
      .filter(o => o.status === 'delivered')
      .reduce((s, o) => s + Number(o.total_amount || 0), 0);

    // Compare with previous equivalent period
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - selectedPeriod.days);
    const prevOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= prevStart && d < start && o.status === 'delivered';
    });
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStock = products.filter(p => (p.stock_quantity || 0) <= 3).length;

    const weeklyViews = analytics.reduce((acc, curr) => acc + (curr.total_views || 0), 0);

    return {
      revenue,
      ordersCount: periodOrders.length,
      pendingOrders,
      lowStock,
      growth,
      weeklyViews,
    };
  }, [orders, products, selectedPeriod, analytics]);

  // Chart data
  const chartBuckets = useMemo(() => buildChartData(orders, selectedPeriod), [orders, selectedPeriod]);
  const chartData = chartBuckets.map(b => b.total);
  const chartLabels = chartBuckets.map(b => b.label);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      loadDashboardData();
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto pt-6 px-6">
        <BackNavigation title="Tableau de Bord" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Bonjour, {store?.name || store?.store_name} 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">Vue d'ensemble de votre activité.</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {/* PERIOD SELECTOR */}
            <div className="relative">
              <button
                onClick={() => setPeriodOpen(v => !v)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all text-sm shadow-sm"
              >
                <Calendar size={16} />
                {selectedPeriod.label}
                <ChevronDown size={14} className={`transition-transform ${periodOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {periodOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden min-w-[160px]"
                  >
                    {PERIODS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPeriod(p); setPeriodOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-slate-50 ${selectedPeriod.id === p.id ? 'text-wa-teal bg-wa-chat' : 'text-slate-700'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/dashboard/add-product"
              className="flex items-center gap-2 px-6 py-3 bg-wa-teal text-white font-black rounded-2xl hover:bg-wa-teal-dark hover:shadow-xl hover:shadow-wa-teal/20 transition-all active:scale-95 text-sm"
            >
              <Plus size={20} /> Nouveau Produit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── QUICK STATS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {/* Revenue */}
          <div className="bg-wa-teal text-white p-6 rounded-[32px] shadow-xl shadow-wa-teal/10 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">
                Revenus · {selectedPeriod.label}
              </p>
              <h3 className="text-3xl font-black mt-2">{formatAmount(stats.revenue)}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                {stats.growth !== null ? (
                  <>
                    <TrendingUp size={12} className={stats.growth < 0 ? 'rotate-180' : ''} />
                    {stats.growth > 0 ? '+' : ''}{stats.growth}% vs période précédente
                  </>
                ) : 'Premières données !'}
              </div>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          {/* Views (Analytics) */}
          <div className="bg-indigo-600 text-white p-6 rounded-[32px] shadow-xl shadow-indigo-600/10 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">
                Vues · 7 derniers jours
              </p>
              <h3 className="text-3xl font-black mt-2">{stats.weeklyViews}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                {stats.weeklyViews > 0 ? 'Excellente visibilité' : 'Générez du trafic !'}
              </div>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          {/* Orders */}
          <div className="bg-emerald-500 text-white p-6 rounded-[32px] shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">
                Commandes · {selectedPeriod.label}
              </p>
              <h3 className="text-3xl font-black mt-2">{stats.ordersCount}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                {stats.ordersCount > 0 ? 'Bonne activité !' : 'En attente...'}
              </div>
            </div>
            <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          {/* Pending */}
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">À préparer</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.pendingOrders}</h3>
            <p className="text-xs text-orange-500 font-bold mt-4 flex items-center gap-1">
              <Clock size={12} /> Action requise
            </p>
          </div>

          {/* Low stock */}
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock faible</p>
            <h3 className={`text-3xl font-black mt-2 ${stats.lowStock > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
              {stats.lowStock}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-4">Articles à réapprovisionner</p>
          </div>
        </div>

        {/* ── LIVREUR QUICK VIEW (DUAL ROLE) ─────────────────────────────── */}
        {livreur && (
          <div className="mt-8 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[24px] flex items-center justify-center text-emerald-400 shadow-inner">
                    <Truck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Hub Livreur Rapide</h3>
                    <p className="text-slate-400 text-sm font-medium">
                      Vous avez <span className="text-emerald-400 font-black">{deliveryCount} livraison{deliveryCount > 1 ? 's' : ''}</span> en cours.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/delivery"
                    className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:scale-105 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                  >
                    Ouvrir le Hub <Truck size={16} />
                  </Link>
                </div>
              </div>
              <Truck className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6">

          {/* ── CHART ──────────────────────────────────────────────────────── */}
          <div className="mt-8">
            <div className="mb-6 flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                  Analyse · {selectedPeriod.label}
                </h4>
                <p className="text-base font-bold text-emerald-700">
                  {stats.revenue > 0
                    ? `${formatAmount(stats.revenue)} encaissés sur cette période.`
                    : 'Aucune vente sur cette période. Continuez à vous promouvoir !'}
                  {stats.growth !== null && stats.growth > 0 && ` En hausse de ${stats.growth}% vs avant.`}
                </p>
              </div>
            </div>
            <PremiumChart data={chartData} labels={chartLabels} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT: Active Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Commandes à traiter</h2>
            <Link href="/dashboard/orders" className="text-xs font-bold text-wa-teal hover:underline">
              Voir tout l'historique
            </Link>
          </div>

          <div className="space-y-4">
            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').slice(0, 5).map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">#{order.id.slice(0, 8).toUpperCase()}</h4>
                      <p className="text-sm text-slate-500 font-medium">{order.customer_name} · {order.customer_phone}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'bg-amber-100 text-amber-700'
                            : order.status === 'processing' ? 'bg-sky-100 text-sky-700'
                              : 'bg-wa-chat text-wa-teal-dark'
                          }`}>
                          {order.status === 'pending' ? 'Nouvelle' : order.status === 'processing' ? 'Préparation' : 'En route'}
                        </span>
                        <span className="text-sm font-black text-wa-teal">{formatAmount(order.total_amount)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-sky-500 text-white text-xs font-bold rounded-xl hover:bg-sky-600 transition-colors"
                      >
                        Préparer
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-teal-dark transition-colors flex items-center justify-center gap-1"
                      >
                        <Truck size={13} /> Expédier
                      </button>
                    )}
                    {(order.status === 'processing' || order.status === 'shipped') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={13} /> Livré
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Annuler"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[32px] py-16 text-center">
                <Package size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Aucune commande en cours.</p>
                <p className="text-slate-300 text-sm mt-1">Les nouvelles commandes apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Products + Alerts */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Vos derniers articles</h2>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              {products.slice(0, 4).map(product => (
                <div key={product.id} className="p-4 flex items-center gap-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                    {product.image_url
                      ? <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate text-sm">{product.name}</p>
                    <p className="text-xs font-black text-wa-teal mt-1">{formatAmount(product.price)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${product.stock_quantity <= 3 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                    {product.stock_quantity} rest.
                  </div>
                </div>
              ))}
              <Link href="/dashboard/products" className="block w-full py-4 text-center text-xs font-black text-slate-400 hover:text-wa-teal transition-colors uppercase tracking-widest bg-slate-50/50">
                Gérer mes produits
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Bell size={18} className="text-wa-teal" /> Alertes
            </h3>
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(n => (
                <div key={n.id} className="text-xs opacity-80 border-l-2 border-wa-teal pl-3 py-1">
                  <p className="font-bold">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              )) : (
                <p className="text-xs opacity-50 italic">Aucune nouvelle alerte.</p>
              )}
            </div>
            <Zap className="absolute -right-6 -top-6 w-20 h-20 text-wa-teal/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
