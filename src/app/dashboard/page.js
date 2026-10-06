'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import BackNavigation from '@/components/BackNavigation';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp, ShoppingCart, AlertTriangle, CheckCircle,
  Bell, Package, Plus, Clock, Zap, Truck, XCircle,
  Calendar, ChevronDown, Sparkles, BarChart3, Layout,
  Eye, Sliders, ExternalLink, RefreshCw, Layers, Check, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumChart from '@/components/PremiumChart';
import SellerAssistantPanel from '@/components/SellerAssistantPanel';
import RefreshBar from '@/components/RefreshBar';
import { getCached, setCached } from '@/lib/dataCache';
import StoreSwitcher from '@/components/studio/StoreSwitcher';
import StudioLivePreview from '@/components/studio/StudioLivePreview';
import StudioSectionEditor from '@/components/studio/StudioSectionEditor';
import StudioLeadsManager from '@/components/studio/StudioLeadsManager';
import { adaptStoreToBusinessProfile } from '@/lib/business-profile/businessProfileAdapter';

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

const PERIODS = [
  { id: '7d', label: '7 jours', days: 7, groupBy: 'day' },
  { id: '30d', label: '30 jours', days: 30, groupBy: 'day' },
  { id: '90d', label: '3 mois', days: 90, groupBy: 'week' },
  { id: '6m', label: '6 mois', days: 182, groupBy: 'week' },
  { id: '1y', label: '1 an', days: 365, groupBy: 'month' },
];

function buildChartData(orders, period) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (period?.days || 7));

  const list = Array.isArray(orders) ? orders : [];
  const filtered = list.filter(o => o && o.created_at && new Date(o.created_at) >= start && o.status === 'delivered');

  if (period?.groupBy === 'day') {
    const buckets = [];
    const days = period.days || 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const total = filtered
        .filter(o => String(o.created_at || '').startsWith(key))
        .reduce((s, o) => s + Number(o.total_amount || 0), 0);
      buckets.push({ label, total });
    }
    return buckets;
  }

  // default / month
  const buckets = [];
  const days = period?.days || 30;
  for (let i = Math.min(days, 30); i >= 0; i -= 5) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    buckets.push({ label, total: 0 });
  }
  return buckets;
}

export default function SellerDashboard() {
  const { loading: authLoading, store, stores, refreshStore } = useAuth();
  const storeId = store?.id;

  const [products,      setProducts]      = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics,     setAnalytics]     = useState([]);
  const [livreur,       setLivreur]       = useState(null);
  const [deliveryCount, setDeliveryCount] = useState(0);

  // Vue Vestin Studio : 'dashboard' | 'studio' | 'preview'
  const [studioMode, setStudioMode] = useState('dashboard');
  const [liveStoreState, setLiveStoreState] = useState(store ? { ...store } : null);
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Affichage fluide non-bloquant
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [periodOpen, setPeriodOpen] = useState(false);

  // Synchroniser l'état local du store quand la boutique active change
  useEffect(() => {
    if (store) {
      setLiveStoreState({ ...store });
    } else {
      setLiveStoreState(null);
    }
  }, [store]);

  // Adapter le profil métier et les capacités en direct
  const businessProfile = useMemo(() => {
    if (!liveStoreState) return null;
    try {
      return adaptStoreToBusinessProfile(liveStoreState, products, []);
    } catch (e) {
      console.warn('[Dashboard] adaptStoreToBusinessProfile error:', e);
      return null;
    }
  }, [liveStoreState, products]);

  const caps = useMemo(() => {
    return businessProfile?.capabilities || {};
  }, [businessProfile]);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!storeId) {
      setProducts([]);
      setOrders([]);
      setNotifications([]);
      setAnalytics([]);
      setDashboardLoading(false);
      return;
    }

    const hasCached = products.length > 0 || orders.length > 0;
    if (!isSilent && !hasCached) setDashboardLoading(true);
    if (isSilent || hasCached) setRefreshing(true);

    try {
      const since = new Date();
      since.setDate(since.getDate() - 90);

      const [productsRes, ordersRes, notifsRes, analyticsRes] = await Promise.all([
        supabase.from('products').select('id, name, price, image_url, stock_quantity, created_at, category').eq('store_id', storeId).order('created_at', { ascending: false }),
        supabase.from('orders').select('id, created_at, status, total_amount, customer_name, customer_phone')
          .eq('store_id', storeId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
        supabase.rpc('get_store_weekly_analytics', { store_id_param: storeId })
      ]);

      const freshProducts = Array.isArray(productsRes?.data) ? productsRes.data : [];
      const freshOrders   = Array.isArray(ordersRes?.data)   ? ordersRes.data   : [];
      const freshNotifs   = Array.isArray(notifsRes?.data)   ? notifsRes.data   : [];
      const freshAnalytics = Array.isArray(analyticsRes?.data) ? analyticsRes.data : [];

      setProducts(freshProducts);
      setOrders(freshOrders);
      setNotifications(freshNotifs);
      setAnalytics(freshAnalytics);

      // Check if user is also a livreur
      if (store?.owner_id) {
        const { data: liv } = await supabase.from('livreurs').select('id').eq('user_id', store.owner_id).maybeSingle();
        if (liv) {
          setLivreur(liv);
          const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
            .eq('livreur_id', liv.id)
            .not('status', 'in', '("delivered","cancelled")');
          setDeliveryCount(count || 0);
        } else {
          setLivreur(null);
          setDeliveryCount(0);
        }
      }
    } catch (err) {
      console.error('Dashboard Load Error:', err);
    } finally {
      setDashboardLoading(false);
      setRefreshing(false);
    }
  }, [storeId, store?.owner_id]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
      if (storeId) {
        let timeout;
        const channel = supabase
          .channel(`dashboard-rt-${storeId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => loadDashboardData(true), 1000);
          })
          .subscribe();

        return () => {
          clearTimeout(timeout);
          supabase.removeChannel(channel);
        };
      }
    }
  }, [authLoading, storeId, loadDashboardData]);

  // Sauvegarde des modifications du Studio (Sections / Thème) dans Supabase
  const handleSaveStoreConfig = async (updatedStore) => {
    if (!store?.id || !updatedStore) return;
    setIsSavingStore(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: updatedStore.name,
          description: updatedStore.description,
          theme_color: updatedStore.theme_color,
          layout_config: updatedStore.layout_config,
          whatsapp_number: updatedStore.whatsapp_number,
          phone: updatedStore.phone,
        })
        .eq('id', store.id);

      if (error) {
        console.error('[Vestin Studio] Erreur sauvegarde store:', error);
        alert('Erreur lors de la sauvegarde : ' + error.message);
      } else {
        await refreshStore();
      }
    } catch (e) {
      console.error('[Vestin Studio] Exception sauvegarde:', e);
    } finally {
      setIsSavingStore(false);
    }
  };

  // Quick stats calculées sur les données réelles (ZÉRO fake data)
  const stats = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const days = selectedPeriod?.days || 7;
    start.setDate(start.getDate() - days);

    const orderList = Array.isArray(orders) ? orders : [];
    const prodList = Array.isArray(products) ? products : [];
    const analyticList = Array.isArray(analytics) ? analytics : [];

    const periodOrders = orderList.filter(o => o && o.created_at && new Date(o.created_at) >= start);
    const revenue = periodOrders
      .filter(o => o.status === 'delivered')
      .reduce((s, o) => s + Number(o.total_amount || 0), 0);

    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - days);
    const prevOrders = orderList.filter(o => {
      if (!o || !o.created_at) return false;
      const d = new Date(o.created_at);
      return d >= prevStart && d < start && o.status === 'delivered';
    });
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

    const pendingOrders = orderList.filter(o => o && o.status === 'pending').length;
    const lowStock = prodList.filter(p => p && Number(p.stock_quantity || 0) <= 3).length;
    const weeklyViews = analyticList.reduce((acc, curr) => acc + (Number(curr?.total_views) || 0), 0);

    return {
      revenue,
      ordersCount: periodOrders.length,
      pendingOrders,
      lowStock,
      growth,
      weeklyViews,
    };
  }, [orders, products, selectedPeriod, analytics]);

  const chartBuckets = useMemo(() => buildChartData(orders, selectedPeriod), [orders, selectedPeriod]);
  const chartData = chartBuckets.map(b => b.total);
  const chartLabels = chartBuckets.map(b => b.label);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      loadDashboardData(true);
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur n'a aucune boutique
  if (!store && (!stores || stores.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🛍️
          </div>
          <h2 className="text-2xl font-black text-slate-900">Bienvenue sur Vestin Studio</h2>
          <p className="text-slate-500 text-sm">
            Vous n'avez pas encore de boutique configurée. Créez votre première vitrine commerciale en 2 minutes.
          </p>
          <Link
            href="/onboarding"
            className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/20"
          >
            Créer ma boutique maintenant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      {refreshing && <RefreshBar />}

      {/* ── HEADER VESTIN STUDIO ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Ligne 1 : Sélecteur boutique + Actions rapides */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <StoreSwitcher />
            </div>

            {/* Actions rapides visibles sur mobile à droite */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {store?.id && (
                <button
                  onClick={() => setStudioMode('studio')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-sm transition"
                  title="Ouvrir le Studio Visuel"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  <span>Studio</span>
                </button>
              )}
              <StudioNotificationCenter store={store} />
            </div>
          </div>

          {/* Ligne 2 : Mode Switcher (Défilement horizontal sans coupure) */}
          <div className="flex items-center justify-between sm:justify-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setStudioMode('dashboard')}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                  studioMode === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Accueil</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioMode('leads')}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                  studioMode === 'leads'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Demandes</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioMode('studio')}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                  studioMode === 'studio'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Sections</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioMode('preview')}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                  studioMode === 'preview'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Aperçu</span>
              </button>
            </div>
          </div>

          {/* Actions rapides Desktop */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {store?.id && (
              <button
                onClick={() => setStudioMode('studio')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black shadow-md shadow-purple-500/20 transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Studio</span>
              </button>
            )}

            <StudioNotificationCenter store={store} />

            {caps[CAPABILITIES.PRODUCT] && (
              <Link
                href="/dashboard/add-product"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Produit</span>
              </Link>
            )}

            {store?.slug && (
              <a
                href={`/boutique/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                title="Ouvrir la vitrine publique"
              >
                <span>Vitrine</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── CORPS DU STUDIO SELON LE MODE ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {studioMode === 'leads' ? (
          /* ── MODE DEMANDES & PROSPECTS (LEADS) ─────────────────────────── */
          <StudioLeadsManager store={store} />
        ) : studioMode === 'studio' ? (
          /* ── MODE STUDIO (SPLIT-VIEW SUR DESKTOP, STACK SUR MOBILE) ─────── */
          <div className="space-y-4">
            {/* Bannière de lancement plein écran */}
            {store?.id && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                      Vestin Shop Builder
                    </span>
                    <span className="text-xs text-slate-300 font-bold">Éditeur Visuel Interactif</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Personnalisez votre logo, composez vos blocs, organisez vos thèmes et testez les vues Mobile/Tablette en plein écran.
                  </p>
                </div>
                <Link
                  href="/mes-sites"
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
                >
                  <Sparkles size={14} className="text-purple-600" />
                  <span>Gérer mes Sites</span>
                  <ExternalLink size={13} className="text-slate-600" />
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Colonne Gauche : Éditeur de Sections */}
              <div className="lg:col-span-5 min-h-[420px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24">
                <StudioSectionEditor
                  store={liveStoreState || store}
                  onStoreChange={setLiveStoreState}
                  onSave={handleSaveStoreConfig}
                  saving={isSavingStore}
                />
              </div>

              {/* Colonne Droite : Live Preview */}
              <div className="lg:col-span-7 min-h-[480px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24">
                <StudioLivePreview
                  store={liveStoreState || store}
                  products={products}
                  modules={[]}
                  initialDevice="desktop"
                />
              </div>
            </div>
          </div>
        ) : studioMode === 'preview' ? (
          /* ── MODE PREVIEW PLEIN ÉCRAN ─────────────────────────────────── */
          <div className="min-h-[500px] h-[calc(100vh-140px)]">
            <StudioLivePreview
              store={liveStoreState || store}
              products={products}
              modules={[]}
              initialDevice="desktop"
            />
          </div>
        ) : (
          /* ── MODE TABLEAU DE BORD ADAPTATIF ───────────────────────────── */
          <div className="space-y-6 sm:space-y-8">
            {/* Header Salutation & Métier */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {{ ecommerce: '🛍️', hotel: '🏨', restaurant: '🍽️', services: '💼', creative: '🎨', event: '🎟️' }[store?.business_type] || '🏪'}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Bonjour, {store?.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Activité : <span className="font-semibold text-emerald-400 capitalize">{store?.business_type || 'Commerce Général'}</span> • Vitrine active
                </p>
              </div>

              {/* Actions Header : Studio Builder + Sélecteur de période */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {store?.id && (
                  <button
                    onClick={() => setStudioMode('studio')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-black rounded-2xl transition shadow-lg shadow-purple-500/20 text-xs hover:scale-105 active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>Personnaliser le Site</span>
                  </button>
                )}

                {/* Sélecteur de période */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setPeriodOpen(v => !v)}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-950 text-slate-200 rounded-2xl font-bold border border-slate-800 hover:border-slate-700 transition text-xs shadow-sm"
                  >
                    <Calendar size={14} className="text-emerald-400" />
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
                        className="absolute right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-w-[150px]"
                      >
                        {PERIODS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedPeriod(p); setPeriodOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition hover:bg-slate-800 ${
                              selectedPeriod.id === p.id ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-300'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Cartes de statistiques (adaptées par capacités) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Revenus ({selectedPeriod.label})</p>
                <h3 className="text-2xl font-black mt-2 text-emerald-400">{formatAmount(stats.revenue)}</h3>
                <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {stats.ordersCount > 0 ? `${stats.ordersCount} commandes enregistrées` : 'En attente des premières ventes'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Commandes & Réservations</p>
                <h3 className="text-2xl font-black mt-2 text-white">{stats.ordersCount}</h3>
                <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
                  {stats.pendingOrders > 0 ? `${stats.pendingOrders} en attente de traitement` : 'Aucune commande en attente'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {caps[CAPABILITIES.SERVICE] ? 'Prestations & Services' : 'Articles & Produits'}
                </p>
                <h3 className="text-2xl font-black mt-2 text-white">{products.length}</h3>
                <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  {stats.lowStock > 0 ? `${stats.lowStock} article(s) à stock faible` : 'Catalogue opérationnel'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visibilité Vitrine</p>
                <h3 className="text-2xl font-black mt-2 text-white">{stats.weeklyViews}</h3>
                <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  Vues sur les 7 derniers jours
                </p>
              </div>
            </div>

            {/* Espace Livreur Dédié (si utilisateur associé au rôle livreur) */}
            {livreur && (
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Espace Livreur Actif</h3>
                    <p className="text-xs text-slate-400">
                      Vous avez <span className="text-emerald-400 font-bold">{deliveryCount} livraison(s)</span> en cours d'acheminement.
                    </p>
                  </div>
                </div>
                <Link
                  href="/delivery"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
                >
                  Ouvrir l'Espace Livreur
                </Link>
              </div>
            )}

            {/* Graphique de Ventes */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Évolution du Chiffre d'Affaires
              </h3>
              <PremiumChart data={chartData} labels={chartLabels} />
            </div>

            {/* Commandes & Produits Réels (ZÉRO Fake Data) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dernières Commandes */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Commandes Récentes</h3>
                  <Link href="/dashboard/orders" className="text-xs text-emerald-400 hover:underline">
                    Tout voir ({orders.length})
                  </Link>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(ord => (
                      <div key={ord.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                        <div>
                          <p className="font-bold text-white">#{String(ord.id || '').slice(0, 8).toUpperCase()}</p>
                          <p className="text-slate-400 text-[11px]">{ord.customer_name || 'Client'} • {formatDate(ord.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">{formatAmount(ord.total_amount)}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ord.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs space-y-2">
                    <ShoppingCart className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="font-semibold text-slate-400">Aucune commande pour le moment</p>
                    <p>Partagez le lien de votre vitrine pour recevoir vos premières commandes.</p>
                  </div>
                )}
              </div>

              {/* Derniers Produits */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {caps[CAPABILITIES.SERVICE] ? 'Services & Prestations' : 'Articles & Stock'}
                  </h3>
                  <Link href="/dashboard/products" className="text-xs text-emerald-400 hover:underline">
                    Gérer ({products.length})
                  </Link>
                </div>

                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 5).map(prod => (
                      <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{prod.name}</p>
                            <p className="text-slate-400 text-[11px]">{prod.category || 'Général'}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-emerald-400">{formatAmount(prod.price)}</p>
                          <span className="text-[10px] text-slate-400 font-medium">Stock: {prod.stock_quantity ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs space-y-2">
                    <Package className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="font-semibold text-slate-400">Aucun produit dans le catalogue</p>
                    <Link
                      href="/dashboard/add-product"
                      className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      Ajouter un premier article
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
