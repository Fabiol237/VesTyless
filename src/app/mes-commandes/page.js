'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Package, Search, ChevronRight, Clock, 
  ShoppingBag, Truck, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

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

      // Refresh status from DB for these orders
      const ids = stored.map(o => o.id);
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at, stores(name)')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      } else {
        // Fallback to stored if DB fails
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
      .select('id, status, total_amount, created_at, stores(name)')
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setSearchResult(data);
      // Optional: Add to localStorage for future visits
      const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
      const newIds = data.map(o => o.id);
      const combined = [...existing, ...data.filter(o => !existing.find(e => e.id === o.id))];
      localStorage.setItem('vestyle_orders', JSON.stringify(combined));
    }
    setSearching(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':    return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped':    return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:           return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Reçue',
      processing: 'En préparation',
      shipped: 'En route',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-28 pb-20">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-wa-teal rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <Package size={30} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suivre mes achats</h1>
          <p className="text-slate-500 mt-2 font-medium">Retrouvez toutes vos commandes Vestyle en un clin d&apos;œil.</p>
        </div>

        {/* Search Bar - Finding orders by phone */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Retrouver par numéro</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="tel" 
                placeholder="Votre numéro de téléphone..." 
                value={phoneSearch}
                onChange={e => setPhoneSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-wa-teal/10 outline-none font-bold text-sm transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={searching}
              className="bg-wa-teal text-white px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-wa-teal-dark transition-all disabled:opacity-50"
            >
              {searching ? '...' : 'Chercher'}
            </button>
          </form>
        </div>

        {/* Order List */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 flex items-center justify-between">
            <span>{searchResult ? 'Résultats de recherche' : 'Commandes enregistrées'}</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{(searchResult || orders).length}</span>
          </h2>

          {(searchResult || orders).length === 0 && !loading ? (
            <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-100">
               <ShoppingBag size={40} className="text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">Aucune commande trouvée sur cet appareil.</p>
               <p className="text-[11px] text-slate-300 mt-1 italic">Utilisez votre numéro de téléphone ci-dessus pour les retrouver.</p>
            </div>
          ) : (
            (searchResult || orders).map((order) => (
              <Link 
                key={order.id} 
                href={`/suivi/${order.id}`}
                className="block bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-wa-teal/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getStatusStyle(order.status)}`}>
                       {order.status === 'delivered' ? <CheckCircle2 size={22} /> : 
                        order.status === 'shipped' ? <Truck size={22} /> : <Clock size={22} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{order.stores?.name || 'Boutique Vestyle'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{Number(order.total_amount).toLocaleString('fr-FR')} F</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))
          )}

          {searchResult && (
            <button 
              onClick={() => setSearchResult(null)}
              className="w-full py-3 text-slate-400 font-bold text-xs hover:text-wa-teal transition-colors"
            >
              ← Retour à mes commandes récentes
            </button>
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}
