'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Store, ShoppingBag, Users, CheckCircle, AlertTriangle, ShieldCheck, Search, Filter, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ stores: 0, products: 0, users: 0 });
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      // Pas de simulation : Compter les éléments dans la base
      const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      setStats({ 
        stores: storeCount || 0,
        products: productCount || 0,
        users: 0 // Si table profile existait
      });

      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentStores(storesData || []);
      setLoading(false);
    }

    loadAdminData();
  }, []);

  const toggleStoreStatus = async (storeId, currentStatus) => {
    // Mutation Active : Super Admin désactive ou active
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const { error } = await supabase
      .from('stores')
      .update({ status: newStatus })
      .eq('id', storeId);

    if (!error) {
      setRecentStores(recentStores.map(s => s.id === storeId ? { ...s, status: newStatus } : s));
    } else {
      alert("Erreur lors de la mise à jour");
    }
  };

  const deleteStore = async (storeId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette boutique ? Tous ses produits seront également supprimés.")) return;
    
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (!error) {
      setRecentStores(recentStores.filter(s => s.id !== storeId));
      setStats(prev => ({ ...prev, stores: prev.stores - 1 }));
    } else {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div></div>;
  }

  const statCards = [
    { title: "Boutiques Totales", value: stats.stores, icon: Store, trend: "+12% ce mois" },
    { title: "Produits en ligne", value: stats.products, icon: ShoppingBag, trend: "+34% ce mois" },
    { title: "Utilisateurs (Clients)", value: "N/A", icon: Users, trend: "Stable" },
  ];

  return (
    <div className="flex-1 lg:ml-64 p-8 overflow-y-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Opérations</h1>
          <p className="text-neutral-400 text-sm mt-1">Supervision centralisée de l&apos;écosystème Vestyle.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
             <input type="text" placeholder="Chercher ID, Nom..." className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-wa-teal transition-colors w-full md:w-64" />
           </div>
        </div>
      </header>

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-neutral-800/50 border border-neutral-700/50 p-6 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-700/50 flex items-center justify-center text-neutral-400">
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{stat.trend}</span>
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-neutral-700 flex justify-between items-center bg-neutral-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck size={20} className="text-wa-teal"/> Modération des Boutiques</h2>
          <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors bg-neutral-700/50 px-3 py-1.5 rounded-lg border border-neutral-600">
            <Filter size={14} /> Filtres
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900/50 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-700">
                <th className="px-6 py-4 font-medium">Boutique</th>
                <th className="px-6 py-4 font-medium">Ville</th>
                <th className="px-6 py-4 font-medium">Vues (24h)</th>
                <th className="px-6 py-4 font-medium">Boost</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {recentStores.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-neutral-500 text-sm">Aucune base de données identifiée</td></tr>
              ) : (
                recentStores.map((store) => (
                  <tr key={store.id} className="hover:bg-neutral-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-700 border border-neutral-600">
                             {store.logo_url && <img src={store.logo_url} alt={store.name || 'logo boutique'} className="w-full h-full object-cover" />}
                         </div>
                         <div>
                            <Link href={`/boutique/${store.slug || store.id}`} className="font-semibold text-white text-sm hover:text-wa-teal transition-colors">{store.name}</Link>
                            <div className="text-xs text-neutral-500">{store.phone}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300">{store.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-wa-teal font-black">{store.daily_views || 0}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={async () => {
                          const { error } = await supabase.from('stores').update({ is_boosted: !store.is_boosted }).eq('id', store.id);
                          if (!error) setRecentStores(recentStores.map(s => s.id === store.id ? { ...s, is_boosted: !s.is_boosted } : s));
                        }}
                        className={`p-2 rounded-lg transition-all ${store.is_boosted ? 'bg-wa-teal text-white shadow-lg shadow-wa-teal/20' : 'bg-neutral-700 text-neutral-500 hover:text-neutral-300'}`}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${store.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                         {store.status === 'approved' ? <><CheckCircle size={12}/> Approuvé</> : <><AlertTriangle size={12}/> Suspendu</>}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => toggleStoreStatus(store.id, store.status)} 
                           className={`text-xs font-bold px-3 py-1.5 rounded transition-colors border ${store.status === 'approved' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                         >
                           {store.status === 'approved' ? 'Suspendre' : 'Autoriser'}
                         </button>
                         <button 
                           onClick={() => deleteStore(store.id)}
                           className="text-neutral-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                           title="Supprimer"
                         >
                           <X size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
