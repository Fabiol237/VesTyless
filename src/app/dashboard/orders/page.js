'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';
import {
  ShoppingCart, Search, Loader2, CheckCircle2, Truck,
  UserCheck, ExternalLink, Copy, Check, AlertCircle, Clock
} from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function normalizeStatus(s) { return (s || 'pending').toLowerCase().trim(); }
function shortId(id) { return (id || '').slice(0, 8).toUpperCase(); }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }
function formatAmount(a) { return Number(a || 0).toLocaleString('fr-FR') + ' F'; }

function StatusBadge({ status }) {
  const n = normalizeStatus(status);
  const map = {
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    shipped: 'bg-sky-100 text-sky-700 border-sky-200',
    processing: 'bg-wa-chat text-wa-teal-dark border-wa-teal/20',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${map[n] || 'bg-amber-100 text-amber-700 border-amber-200'}`}>
      {status || 'pending'}
    </span>
  );
}

export default function OrdersPage() {
  const { store } = useAuth();
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [pageError, setPageError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const [{ data: ordersData }, { data: livreursData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*, livreurs(id, name, phone, is_available)')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false }),
        supabase.from('livreurs').select('*').eq('store_id', store.id).eq('is_available', true),
      ]);
      setOrders(ordersData || []);
      setLivreurs(livreursData || []);
    } catch {
      setPageError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime order updates
  useEffect(() => {
    if (!store?.id) return;
    const channel = supabase
      .channel(`orders-store-${store.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${store.id}` },
        () => fetchAll()
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [store?.id, fetchAll]);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order.id);
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const handlePaymentChange = async (order, method) => {
    setUpdatingId(`pay-${order.id}`);
    await supabase.from('orders').update({ payment_method: method }).eq('id', order.id);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_method: method } : o));
    setUpdatingId(null);
  };

  const handleAssignLivreur = async (order, livreurId) => {
    setAssigningId(order.id);
    // Generate a unique livreur token if not already set
    let token = order.livreur_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }
    await supabase.from('orders').update({
      livreur_id: livreurId || null,
      livreur_token: livreurId ? token : null,
      status: livreurId ? 'shipped' : order.status,
    }).eq('id', order.id);
    setOrders(prev => prev.map(o => o.id === order.id ? {
      ...o,
      livreur_id: livreurId || null,
      livreur_token: livreurId ? token : null,
      status: livreurId ? 'shipped' : o.status,
    } : o));
    setAssigningId(null);
  };

  const copyLivreurLink = async (token) => {
    const url = `${window.location.origin}/livreur/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sendWhatsAppToLivreur = (order, livreur) => {
    const url = `${window.location.origin}/livreur/${order.livreur_token}`;
    const msg = `Bonjour ${livreur.name} 🛵\n\nVous avez une nouvelle livraison à effectuer.\n\n📦 Commande: #${shortId(order.id)}\n👤 Client: ${order.customer_name}\n📞 Tél: ${order.customer_phone}\n\n🔗 Démarrez votre suivi ici:\n${url}`;
    window.open(`https://wa.me/${livreur.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredOrders = orders.filter(o => {
    const t = searchTerm.toLowerCase();
    return (
      (o.customer_name || '').toLowerCase().includes(t) ||
      (o.customer_phone || '').includes(t) ||
      (o.id || '').toLowerCase().includes(t) ||
      (o.status || '').toLowerCase().includes(t)
    );
  });

  const quickStats = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'processing'].includes(normalizeStatus(o.status))).length,
    shipped: orders.filter(o => normalizeStatus(o.status) === 'shipped').length,
    delivered: orders.filter(o => normalizeStatus(o.status) === 'delivered').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-wa-teal mb-1">Gestion des commandes</p>
            <h1 className="text-2xl font-black text-gray-900">Commandes & Livraisons</h1>
            <p className="text-sm text-gray-500 mt-1">Suivez les livraisons de votre boutique en temps réel.</p>
          </div>
        </div>
      </div>

      {pageError && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <AlertCircle size={18} /> {pageError}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: quickStats.total, color: 'bg-gray-900 text-white' },
          { label: 'En attente', value: quickStats.pending, color: 'bg-amber-500 text-white' },
          { label: 'En route', value: quickStats.shipped, color: 'bg-sky-500 text-white' },
          { label: 'Livrées', value: quickStats.delivered, color: 'bg-emerald-500 text-white' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5 shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          type="search"
          placeholder="Rechercher par client, téléphone, ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse bg-white rounded-3xl shadow-sm" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
            <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucune commande</h2>
            <p className="text-sm text-gray-500">Les commandes de vos clients apparaîtront ici.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Order header */}
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-wa-chat rounded-2xl flex items-center justify-center">
                    <ShoppingCart size={18} className="text-wa-teal" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">#{shortId(order.id)}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  {order.confirmed_at && (
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> Reçu confirmé
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Details Bar */}
              <div className="px-6 py-3 bg-amber-50/50 border-b border-gray-50 flex flex-wrap gap-4 items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium text-xs">Paiement :</span>
                  <select
                    value={order.payment_method || 'cash'}
                    onChange={e => handlePaymentChange(order, e.target.value)}
                    disabled={updatingId === `pay-${order.id}`}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none focus:border-amber-400"
                  >
                    <option value="cash">Paiement à la livraison (Cash)</option>
                    <option value="mobile_money">Mobile Money (Prépayé)</option>
                  </select>
                </div>
                
                {order.payment_method === 'cash' && order.status === 'delivered' && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    {order.cash_remitted ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Cash restitué ✓</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Cash à récupérer par le livreur</span>
                    )}
                  </div>
                )}
              </div>

              {/* Order body */}
              <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Client</p>
                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-2 leading-relaxed">
                    {Array.isArray(order.order_items)
                      ? `${order.order_items.length} article(s) — ${formatAmount(order.total_amount)}`
                      : formatAmount(order.total_amount)
                    }
                  </p>
                  <Link
                    href={`/track/${order.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-wa-teal hover:underline"
                  >
                    <ExternalLink size={12} /> Page de suivi client
                  </Link>
                </div>

                {/* Status update */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</p>
                  <select
                    value={order.status || 'pending'}
                    onChange={e => handleStatusChange(order, e.target.value)}
                    disabled={updatingId === order.id}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-wa-teal focus:ring-4 focus:ring-wa-chat disabled:opacity-50 transition-all"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {updatingId === order.id && (
                    <p className="text-xs text-wa-teal flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Mise à jour...
                    </p>
                  )}
                </div>

                {/* Livreur assignment */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Livreur assigné</p>

                  {order.livreurs ? (
                    <div className="flex items-center gap-2 p-3 bg-wa-chat rounded-xl border border-wa-teal/20">
                      <div className="w-8 h-8 bg-wa-teal rounded-xl flex items-center justify-center text-white font-black text-sm">
                        {order.livreurs.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-wa-teal-dark text-sm truncate">{order.livreurs.name}</p>
                        <p className="text-xs text-wa-teal">{order.livreurs.phone}</p>
                      </div>
                      <button
                        onClick={() => handleAssignLivreur(order, null)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        disabled={assigningId === order.id}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value=""
                      onChange={e => e.target.value && handleAssignLivreur(order, e.target.value)}
                      disabled={assigningId === order.id || livreurs.length === 0}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-wa-teal focus:ring-4 focus:ring-wa-chat disabled:opacity-50 transition-all"
                    >
                      <option value="">{livreurs.length === 0 ? 'Aucun livreur dispo' : '— Assigner un livreur —'}</option>
                      {livreurs.map(l => (
                        <option key={l.id} value={l.id}>{l.name} {l.phone ? `(${l.phone})` : ''}</option>
                      ))}
                    </select>
                  )}

                  {assigningId === order.id && (
                    <p className="text-xs text-wa-teal flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Assignation...
                    </p>
                  )}

                  {/* Livreur link & WhatsApp */}
                  {order.livreur_token && order.livreurs && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyLivreurLink(order.livreur_token)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                      >
                        {copiedId === order.livreur_token ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copiedId === order.livreur_token ? 'Copié !' : 'Lien livreur'}
                      </button>
                      <button
                        onClick={() => sendWhatsAppToLivreur(order, order.livreurs)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 rounded-xl transition-all"
                      >
                        📲 Envoyer WA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

