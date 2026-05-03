'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

import { 
  TrendingUp, ShoppingCart, AlertTriangle, CheckCircle,
  Bell, ArrowRight, Package, Store, Settings, Plus,
  ChevronRight, Clock, Zap, BarChart2
} from 'lucide-react';

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

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function getOrderTotal(order) {
  const total = Number(order?.total_amount ?? order?.total ?? order?.amount ?? 0);
  return Number.isNaN(total) ? 0 : total;
}

function getProductStock(product) {
  const stock = Number(product?.stock_quantity ?? product?.stock ?? 0);
  return Number.isNaN(stock) ? 0 : stock;
}

async function runQuery(buildQuery) {
  try {
    const { data, error } = await buildQuery();
    return { data: Array.isArray(data) ? data : [], error: error || null };
  } catch (error) {
    return { data: [], error };
  }
}

export default function SellerDashboard() {
  const { loading: authLoading, session, store } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const storeId = store?.id;
  const realtimeEnabled =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    typeof supabase?.channel === 'function';

  const loadDashboardData = useCallback(async () => {
    if (!storeId) { setDashboardLoading(false); return; }
    setDashboardLoading(true);
    const [productsResult, ordersResult, notificationsResult] = await Promise.all([
      runQuery(() => supabase.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: false })),
      runQuery(() => supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false })),
      runQuery(() => supabase.from('notifications').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5)),
    ]);
    setProducts(productsResult.data);
    setOrders(ordersResult.data);
    setNotifications(notificationsResult.data);
    setDashboardLoading(false);
  }, [storeId]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      await loadDashboardData();
    })();
  }, [authLoading, loadDashboardData]);

  useEffect(() => {
    if (!storeId || !realtimeEnabled) return;
    const channel = supabase.channel(`seller-dashboard-${storeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `store_id=eq.${storeId}` }, loadDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, loadDashboardData)
      .subscribe();
    return () => supabase.removeChannel?.(channel);
  }, [loadDashboardData, realtimeEnabled, storeId]);

  const stats = useMemo(() => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const revenue = orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const monthlyOrders = orders.filter(o => o?.created_at && new Date(o.created_at) >= monthStart).length;
    const lowStock = products.filter(p => getProductStock(p) <= 3);
    const delivered = orders.filter(o => normalizeStatus(o?.status) === 'delivered').length;
    const inProgress = orders.filter(o => {
      const s = normalizeStatus(o?.status);
      return s && s !== 'delivered' && s !== 'cancelled' && s !== 'canceled';
    }).length;
    return { revenue, monthlyOrders, lowStock, delivered, inProgress };
  }, [orders, products]);

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)).slice(0, 5),
    [orders]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Store size={28} className="text-neutral-400" />
          </div>
          <h1 className="text-xl font-bold text-wa-teal-dark mb-2">Accès vendeur</h1>
          <p className="text-sm text-neutral-500 mb-7">Connectez-vous pour accéder à votre espace vendeur.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-wa-green text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-wa-teal-dark transition-colors shadow-sm">
            Se connecter <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="min-h-screen bg-wa-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-wa-chat rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Store size={28} className="text-wa-teal" />
          </div>
          <h1 className="text-xl font-bold text-wa-teal-dark mb-2">Aucune boutique liée</h1>
          <p className="text-sm text-neutral-500">Créez ou associez une boutique pour voir vos statistiques.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wa-bg pb-16">

      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-wa-teal text-white shadow-md">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-wa-green/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/70 mb-3">
                <Zap size={12} className="text-wa-teal" />
                {realtimeEnabled ? 'Données en temps réel' : 'Mode démo'}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{store?.name || 'Votre boutique'}</h1>
                {store?.store_code && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 shadow-sm" title="Code Boutique">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Code:</span>
                    <span className="text-lg font-black text-white tracking-widest">{store.store_code}</span>
                  </div>
                )}
              </div>
              <p className="text-white/60 text-sm mt-1">
                {orders.length} commande{orders.length !== 1 ? 's' : ''} · {products.length} produit{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Link href="/dashboard/orders" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                <ShoppingCart size={16} /> Commandes
              </Link>
              <Link href="/dashboard/add-product" className="flex items-center gap-2 bg-wa-green hover:bg-[#1DA851] transition-colors px-4 py-2.5 rounded-xl text-sm font-bold shadow-md">
                <Plus size={16} /> Ajouter produit
              </Link>
              <Link href="/dashboard/settings" className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 transition-colors rounded-xl shadow-sm">
                <Settings size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: 'Revenus', value: formatAmount(stats.revenue), hint: 'Cumulés', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { title: 'Commandes', value: String(stats.monthlyOrders), hint: 'Ce mois', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Stock faible', value: String(stats.lowStock.length), hint: 'Alertes', icon: AlertTriangle, color: stats.lowStock.length > 0 ? 'text-rose-500' : 'text-emerald-500', bg: stats.lowStock.length > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
            { title: 'Livraisons', value: `${stats.delivered}/${stats.inProgress}`, hint: 'Livrées / En cours', icon: CheckCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{s.title}</p>
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon size={18} className={s.color} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none">{s.value}</p>
              <p className="text-xs text-neutral-400 mt-1.5">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-4 xl:grid-cols-[1.3fr,0.9fr]">

          {/* Recent Orders */}
            <section
            className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-neutral-900">Commandes récentes</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Dernières activités de votre boutique</p>
              </div>
              <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs font-bold text-wa-teal hover:text-wa-teal-dark transition-colors">
                Voir tout <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-2">
              {dashboardLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-50 rounded-2xl animate-pulse" />
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order, i) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                  <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-neutral-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">#{String(order.id || '').slice(0, 8)}</p>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-black text-neutral-900">{formatAmount(getOrderTotal(order))}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-10 text-center">
                  <ShoppingCart size={28} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Aucune commande pour l&apos;instant.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Column */}
          <div className="flex flex-col gap-4">

            {/* Notifications */}
            <section
              className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-sm p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                  <Bell size={16} className="text-wa-teal" /> Notifications
                </h2>
                <span className="bg-wa-chat text-wa-teal-dark text-xs font-black px-2.5 py-1 rounded-full">
                  {notifications.filter(n => !n.is_read).length || 0} new
                </span>
              </div>
              <div className="space-y-2">
                {dashboardLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-neutral-50 rounded-xl animate-pulse" />)
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 rounded-xl border text-sm ${n.is_read ? 'border-neutral-100 bg-neutral-50' : 'border-wa-teal/20 bg-wa-chat'}`}>
                      <p className="font-bold text-neutral-900 text-xs">{n.title || 'Notification'}</p>
                      <p className="text-neutral-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <Bell size={24} className="text-neutral-200 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">Aucune notification.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Stock Alerts */}
              <section
              className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-sm p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" /> Stock faible
                </h2>
                <span className="bg-amber-100 text-amber-600 text-xs font-black px-2.5 py-1 rounded-full">
                  {stats.lowStock.length} alerte{stats.lowStock.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {dashboardLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-neutral-50 rounded-xl animate-pulse" />)
                ) : stats.lowStock.length > 0 ? (
                  stats.lowStock.sort((a, b) => getProductStock(a) - getProductStock(b)).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{p.name}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Réapprovisionnement requis</p>
                      </div>
                      <span className="ml-3 flex-shrink-0 bg-white text-amber-700 font-black text-xs px-2.5 py-1 rounded-lg border border-amber-200">
                        {getProductStock(p)} rest.
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-5 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 text-center">
                    <p className="text-xs text-emerald-600 font-semibold">✓ Tous les stocks sont OK</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Links */}
              <div
              className="grid grid-cols-2 gap-3"
            >
              {[
                { href: '/dashboard/products', label: 'Produits', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
                { href: '/dashboard/orders', label: 'Commandes', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-50' },
                { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, color: 'text-neutral-500', bg: 'bg-neutral-100' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
                >
                  <div className={`w-8 h-8 ${link.bg} rounded-xl flex items-center justify-center`}>
                    <link.icon size={16} className={link.color} />
                  </div>
                  <span className="text-sm font-bold text-neutral-800">{link.label}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const styles =
    normalized === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
    normalized === 'shipped' ? 'bg-sky-100 text-sky-700' :
    normalized === 'cancelled' || normalized === 'canceled' ? 'bg-rose-100 text-rose-700' :
    'bg-amber-100 text-amber-700';

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize whitespace-nowrap ${styles}`}>
      {status || 'pending'}
    </span>
  );
}

