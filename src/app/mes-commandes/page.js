'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import BackNavigation from '@/components/BackNavigation';
import Footer from '@/components/Footer';
import { 
  Package, Search, ChevronRight, Clock, 
  ShoppingBag, Truck, CheckCircle2, AlertCircle,
  Phone, Hash, Calendar, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    async function loadStoredOrders() {
      const stored = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
      if (stored.length === 0) {
        setLoading(false);
        return;
      }

      const ids = stored.map(o => o.id);
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at, stores(name, logo_url)')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      } else {
        setOrders(stored);
      }
      setLoading(false);
    }
    loadStoredOrders();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phoneSearch.trim()) return;
    setSearching(true);
    setSearchResult(null);

    const cleanPhone = phoneSearch.replace(/\D/g, '');
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, stores(name, logo_url)')
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setSearchResult(data);
      const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
      const combined = [...existing, ...data.filter(o => !existing.find(e => e.id === o.id))];
      localStorage.setItem('vestyle_orders', JSON.stringify(combined));
    }
    setSearching(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':    return 'text-amber-500 bg-amber-50';
      case 'processing': return 'text-blue-500 bg-blue-50';
      case 'shipped':    return 'text-purple-500 bg-purple-50';
      case 'delivered':  return 'text-emerald-500 bg-emerald-50';
      case 'cancelled':  return 'text-rose-500 bg-rose-50';
      default:           return 'text-slate-400 bg-slate-50';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Reçue',
      processing: 'En préparation',
      shipped: 'En livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-32 pb-24">
        <BackNavigation title="Mes Commandes" />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Mes Commandes</h1>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">Suivez vos achats et accédez à vos factures certifiées en un clin d'œil.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="tel" 
                  placeholder="Votre numéro (ex: 677...)" 
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-wa-teal/10 focus:bg-white outline-none font-bold text-base transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={searching}
                className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-wa-teal transition-all disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
              >
                {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Retrouver'}
              </button>
            </div>
            <p className="mt-4 text-[10px] text-center text-slate-300 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Hash size={10} /> Vos 10 dernières commandes
            </p>
          </form>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {searchResult ? 'Résultats trouvés' : 'Historique récent'}
          </h2>
          {searchResult && (
            <button onClick={() => setSearchResult(null)} className="text-[10px] font-black text-wa-teal uppercase tracking-widest">Voir tout</button>
          )}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {(searchResult || orders).length === 0 && !loading ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                 <ShoppingBag size={40} />
               </div>
               <p className="text-slate-900 font-black text-lg">Aucune commande</p>
               <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">Recherchez avec votre numéro de téléphone pour voir vos achats.</p>
            </div>
          ) : (
            (searchResult || orders).map((order) => (
              <Link 
                key={order.id} 
                href={`/suivi/${order.id}`}
                className="block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-wa-teal/20 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                       <img src={order.stores?.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 tracking-tight">#{(order.id||'').slice(0,8).toUpperCase()}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold">{order.stores?.name}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-300 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tight">{Number(order.total_amount).toLocaleString()} F</p>
                    <div className="flex items-center justify-end gap-1 mt-2 text-wa-teal font-black text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Suivre <ArrowRight size={10} />
                    </div>
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-wa-teal/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              </Link>
            ))
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}
