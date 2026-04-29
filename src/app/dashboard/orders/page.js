'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';
import {
  ShoppingCart, Search, Loader2, CheckCircle2,
  ExternalLink, Clock, DollarSign, MessageCircle,
  ChevronRight, Calendar, Phone, MapPin
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'pending', label: 'Nouvelle' },
  { id: 'processing', label: 'En préparation' },
  { id: 'shipped', label: 'En cours de livraison' },
  { id: 'delivered', label: 'Livrée' },
  { id: 'cancelled', label: 'Annulée' }
];

function normalizeStatus(s) { return (s || 'pending').toLowerCase().trim(); }
function shortId(id) { return (id || '').slice(0, 8).toUpperCase(); }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }
function formatAmount(a) { return Number(a || 0).toLocaleString('fr-FR') + ' F'; }

function StatusBadge({ status }) {
  const n = normalizeStatus(status);
  const map = {
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle2, label: 'Livrée' },
    shipped: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', icon: Calendar, label: 'En route' },
    processing: { bg: 'bg-wa-chat', text: 'text-wa-teal-dark', border: 'border-wa-teal/10', icon: Clock, label: 'Préparation' },
    cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: ShoppingCart, label: 'Annulée' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Loader2, label: 'Nouvelle' },
  };
  const config = map[n] || map.pending;
  const Icon = config.icon;
  
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} className={n === 'pending' ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const { store } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [pageError, setPageError] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setPageError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Realtime order updates
  useEffect(() => {
    if (!store?.id) return;
    const channel = supabase
      .channel(`orders-store-${store.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${store.id}` },
        () => fetchOrders()
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [store?.id, fetchOrders]);

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

  const sendWhatsAppToCustomer = (order) => {
    const statusLabel = STATUS_OPTIONS.find(s => s.id === normalizeStatus(order.status))?.label || order.status;
    const msg = `Bonjour ${order.customer_name} ! 🌟\nC'est la boutique ${store?.store_name}.\n\nNous avons bien reçu votre commande #${shortId(order.id)}.\nStatut actuel : ${statusLabel}\nTotal : ${formatAmount(order.total_amount)}\n\nMerci de votre confiance !`;
    window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredOrders = orders.filter(o => {
    const t = searchTerm.toLowerCase();
    const statusLabel = STATUS_OPTIONS.find(s => s.id === normalizeStatus(o.status))?.label || '';
    return (
      (o.customer_name || '').toLowerCase().includes(t) ||
      (o.customer_phone || '').includes(t) ||
      (o.id || '').toLowerCase().includes(t) ||
      statusLabel.toLowerCase().includes(t)
    );
  });

  const stats = {
    total: orders.length,
    revenue: orders.filter(o => normalizeStatus(o.status) === 'delivered').reduce((acc, o) => acc + (o.total_amount || 0), 0),
    pending: orders.filter(o => ['pending', 'processing'].includes(normalizeStatus(o.status))).length,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Suivi des Ventes</h1>
          <p className="text-gray-500 font-medium mt-1">Gérez vos commandes et communiquez avec vos clients.</p>
        </div>
        <div className="bg-wa-chat px-6 py-4 rounded-2xl border border-wa-teal/10 flex items-center gap-4">
          <div className="bg-wa-teal p-2 rounded-xl text-white">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-wa-teal-dark uppercase tracking-widest">Revenu total encaissé</p>
            <p className="text-xl font-black text-wa-teal-dark">{formatAmount(stats.revenue)}</p>
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Commandes', value: stats.total, icon: ShoppingCart, color: 'bg-wa-teal' },
          { label: 'En préparation', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
          { label: 'Livrées', value: orders.filter(o => normalizeStatus(o.status) === 'delivered').length, icon: CheckCircle2, color: 'bg-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-wa-teal/30 transition-all cursor-default">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 focus-within:ring-4 focus-within:ring-wa-chat/50 transition-all">
        <Search size={20} className="text-gray-400 shrink-0 ml-2" />
        <input
          type="search"
          placeholder="Rechercher un client, un numéro ou un statut..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium py-2"
        />
      </div>

      {/* Orders Feed */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse bg-gray-50 rounded-[32px] border border-gray-100" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <ShoppingCart size={40} />
            </div>
            <h2 className="text-lg font-black text-gray-900">Aucune commande trouvée</h2>
            <p className="text-sm text-gray-500 mt-1">Vos ventes apparaîtront ici dès qu'un client passe commande.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="group bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="px-6 sm:px-8 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-wa-chat rounded-2xl flex items-center justify-center text-wa-teal group-hover:scale-110 transition-transform">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg tracking-tight">#{shortId(order.id)}</h3>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                      <Calendar size={12} /> {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  {order.confirmed_at && (
                    <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">Confirmé par client</span>
                  )}
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Customer Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 mt-1">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Client</p>
                      <p className="font-black text-gray-900">{order.customer_name}</p>
                      <p className="text-sm font-bold text-gray-500">{order.customer_phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => sendWhatsAppToCustomer(order)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-black rounded-xl hover:bg-[#128C7E] transition-all shadow-lg shadow-[#25D366]/10 text-sm"
                  >
                    <MessageCircle size={18} />
                    <span>Contacter sur WhatsApp</span>
                  </button>
                </div>

                {/* Payment & Items */}
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 mt-1">
                      <DollarSign size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paiement & Montant</p>
                      <select
                        value={order.payment_method || 'cash'}
                        onChange={e => handlePaymentChange(order, e.target.value)}
                        disabled={updatingId === `pay-${order.id}`}
                        className="w-full bg-gray-50 border border-transparent focus:border-wa-teal rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none transition-all cursor-pointer"
                      >
                        <option value="cash">Paiement à la livraison</option>
                        <option value="mobile_money">Mobile Money (Prépayé)</option>
                      </select>
                      <p className="text-xl font-black text-wa-teal-dark mt-2 tracking-tight">{formatAmount(order.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 mt-1">
                      <MapPin size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Changer le statut</p>
                      <select
                        value={order.status || 'pending'}
                        onChange={e => handleStatusChange(order, e.target.value)}
                        disabled={updatingId === order.id}
                        className="w-full bg-white border-2 border-wa-teal/10 focus:border-wa-teal rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none transition-all cursor-pointer shadow-sm"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Link
                    href={`/track/${order.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-xs font-black text-gray-400 hover:text-wa-teal transition-colors group"
                  >
                    <span>Lien de suivi client</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
