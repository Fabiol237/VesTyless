'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, ShoppingCart, AlertTriangle, CheckCircle,
  Bell, ArrowRight, Package, Store, Settings, Plus,
  ChevronRight, Clock, Zap, BarChart2, MapPin, Truck, XCircle
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

export default function SellerDashboard() {
  const { loading: authLoading, session, store } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const storeId = store?.id;

  const loadDashboardData = useCallback(async () => {
    if (!storeId) { setDashboardLoading(false); return; }
    setDashboardLoading(true);
    try {
      const [productsRes, ordersRes, notifsRes] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setNotifications(notifsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDashboardLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (!authLoading && storeId) loadDashboardData();
  }, [authLoading, storeId, loadDashboardData]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    
    const todayOrdersList = orders.filter(o => new Date(o.created_at) >= today);
    const yesterdayOrdersList = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= yesterday && d < today;
    });

    const todayRevenue = todayOrdersList.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const yesterdayRevenue = yesterdayOrdersList.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    
    let growth = null;
    if (yesterdayRevenue > 0) {
      growth = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    }

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStock = products.filter(p => (p.stock_quantity || 0) <= 3).length;
    
    return { todayRevenue, todayOrders: todayOrdersList.length, pendingOrders, lowStock, growth };
  }, [orders, products]);

  const chartPoints = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    orders.forEach(o => {
      const orderDate = new Date(o.created_at);
      const diff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const dayIdx = (orderDate.getDay() + 6) % 7; // Recalage Lundi=0
        days[dayIdx] += Number(o.total_amount || 0);
      }
    });
    return days;
  }, [orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      loadDashboardData();
    } catch (err) {
      alert('Erreur lors de la mise à jour.');
    }
  };

  if (authLoading || dashboardLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bonjour, {store?.name} 👋</h1>
              <p className="text-slate-500 font-medium mt-1">Voici l'activité de votre commerce aujourd'hui.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/add-product" className="flex items-center gap-2 px-6 py-3 bg-wa-teal text-white rounded-2xl font-bold shadow-lg shadow-wa-teal/20 hover:scale-105 transition-all">
                <Plus size={18} /> Nouveau Produit
              </Link>
            </div>
          </div>

          {/* QUICK STATS - LARGE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="bg-wa-teal text-white p-6 rounded-[32px] shadow-xl shadow-wa-teal/10 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest opacity-70">Ventes du jour</p>
                <h3 className="text-3xl font-black mt-2">{formatAmount(stats.todayRevenue)}</h3>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  {stats.growth !== null ? (
                    <>
                      <TrendingUp size={12} className={stats.growth < 0 ? 'rotate-180' : ''} />
                      {stats.growth > 0 ? '+' : ''}{stats.growth}% vs hier
                    </>
                  ) : (
                    "Premières ventes !"
                  )}
                </div>
              </div>
              <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-emerald-500 text-white p-6 rounded-[32px] shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest opacity-70">Commandes reçues</p>
                <h3 className="text-3xl font-black mt-2">{stats.todayOrders}</h3>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  {stats.todayOrders > 0 ? "Bonne activité !" : "En attente..."}
                </div>
              </div>
              <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">À préparer</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.pendingOrders}</h3>
              <p className="text-xs text-orange-500 font-bold mt-4 flex items-center gap-1">
                <Clock size={12} /> Action requise
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock faible</p>
              <h3 className={`text-3xl font-black mt-2 ${stats.lowStock > 0 ? 'text-rose-500' : 'text-slate-900'}`}>{stats.lowStock}</h3>
              <p className="text-xs text-slate-400 font-bold mt-4">Articles à réapprovisionner</p>
            </div>
          </div>

          {/* PREMIUM CHART - TRENDS */}
          <div className="mt-8">
             <div className="mb-6 flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                   <TrendingUp size={24} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Analyse simplifiée</h4>
                   <p className="text-base font-bold text-emerald-700">
                      {stats.todayRevenue > 0 ? 
                        `Félicitations ! Vous avez déjà encaissé ${formatAmount(stats.todayRevenue)} aujourd'hui.` : 
                        "En attente de la première vente du jour. Courage, ça va venir !"}
                      {Math.max(...chartPoints) > 0 && ` Votre meilleur moment cette semaine était ${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][chartPoints.indexOf(Math.max(...chartPoints))]}.`}
                   </p>
                </div>
             </div>
             <PremiumChart data={chartPoints} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: ACTIVE ORDERS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Commandes à traiter</h2>
            <Link href="/dashboard/orders" className="text-xs font-bold text-wa-teal hover:underline">Voir tout l'historique</Link>
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
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {order.status === 'pending' ? 'Attente' : 'En route'}
                        </span>
                        <span className="text-sm font-black text-wa-teal">{formatAmount(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS - DIRECT STATUS CHANGE */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-sky-500 text-white text-xs font-bold rounded-xl hover:bg-sky-600 transition-colors"
                      >
                        Prêt à expédier
                      </button>
                    )}
                    {order.status === 'processing' || order.status === 'shipped' ? (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} /> Marquer Livré
                      </button>
                    ) : null}
                    {order.status === 'processing' && (
                       <button 
                       onClick={() => updateOrderStatus(order.id, 'shipped')}
                       className="flex-1 sm:flex-none px-4 py-2.5 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-teal-dark transition-colors flex items-center justify-center gap-2"
                     >
                       <Truck size={14} /> Expédier
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
            {orders.length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[32px] py-16 text-center">
                <Package size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Aucune commande pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT PRODUCTS & ALERTS */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Vos derniers articles</h2>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              {products.slice(0, 4).map(product => (
                <div key={product.id} className="p-4 flex items-center gap-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
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

          {/* NOTIFICATIONS */}
          <div className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden">
             <h3 className="text-lg font-black mb-4 flex items-center gap-2">
               <Bell size={18} className="text-wa-teal" /> Alertes
             </h3>
             <div className="space-y-4">
               {notifications.length > 0 ? notifications.map(n => (
                 <div key={n.id} className="text-xs opacity-80 border-l-2 border-wa-teal pl-3 py-1">
                   <p className="font-bold">{n.title}</p>
                   <p className="mt-0.5 line-clamp-1">{n.message}</p>
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
