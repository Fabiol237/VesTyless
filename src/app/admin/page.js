'use client';
import { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  Sparkles, 
  X, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  MapPin,
  Phone,
  Clock,
  Activity,
  Globe,
  Cpu,
  Layers,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleStoreStatusAction, toggleStoreBoostAction, deleteStoreAction, getAdminStatsAction, searchStoresAction, triggerMorningPulseAction } from './actions';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    stores: 0, 
    products: 0, 
    users: 0, 
    totalRevenue: 0, 
    pendingOrders: 0,
    revenueGrowth: 0,
    topStores: [],
    activity: []
  });
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      const [s, { data }] = await Promise.all([
        getAdminStatsAction(),
        searchStoresAction('')
      ]);
      setStats(s);
      setRecentStores(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleBroadcast = async () => {
    if (!confirm("Diffuser le 'Matin Pulse' à tous les vendeurs ?")) return;
    setLoading(true);
    const res = await triggerMorningPulseAction();
    setLoading(false);
    if (res.success) alert(`Pulse envoyé avec succès à ${res.log.length} boutiques.`);
  };

  const toggleStoreStatus = async (id, current) => {
    const { error } = await toggleStoreStatusAction(id, current);
    if (!error) {
      setRecentStores(recentStores.map(s => s.id === id ? { ...s, verified: !current } : s));
    }
  };

  const deleteStore = async (id) => {
    if (!confirm("CONFIRMATION REQUISE : Suppression définitive de l'entité ?")) return;
    const { error } = deleteStoreAction(id);
    if (!error) {
      setRecentStores(recentStores.filter(s => s.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 border-2 border-slate-200 border-t-wa-teal rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center font-black text-[8px] text-slate-400 animate-pulse uppercase tracking-widest">
            Core Link
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top HUD Light Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-wa-teal/10 px-3 py-1 rounded-full border border-wa-teal/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-ping" />
                <span className="text-[10px] font-black text-wa-teal tracking-[0.2em] uppercase">Status Active</span>
             </div>
             <div className="text-slate-400 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                <Clock size={12} /> {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
            Market <span className="text-slate-300">Pulse.</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
           <div className="relative group flex-1 sm:w-80">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-wa-teal transition-colors" />
              <input 
                type="text" 
                placeholder="SYSTEM COMMANDS..." 
                className="w-full bg-slate-50 border-none text-xs font-bold text-slate-900 pl-14 pr-6 py-4 rounded-[2rem] focus:ring-1 focus:ring-wa-teal/30 transition-all placeholder:text-slate-300" 
              />
           </div>
           <button 
             onClick={handleBroadcast}
             className="bg-slate-900 text-white h-[52px] px-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-wa-teal hover:text-black transition-all"
           >
              Broadcast
           </button>
        </div>
      </header>

      {/* Main Grid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats Column */}
        <div className="lg:col-span-3 space-y-4">
           {[
             { label: 'Network Revenue', value: `${stats.totalRevenue.toLocaleString()} F`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600', trend: `+${stats.revenueGrowth}%` },
             { label: 'Entities', value: stats.stores, icon: Store, color: 'bg-blue-100 text-blue-600', trend: 'STABLE' },
             { label: 'Active Users', value: stats.users, icon: Users, color: 'bg-orange-100 text-orange-600', trend: 'SYNC' },
             { label: 'Processing', value: stats.pendingOrders, icon: Cpu, color: 'bg-amber-100 text-amber-600', trend: 'LIVE' },
           ].map((card, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-wa-teal transition-all group relative overflow-hidden shadow-sm"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2.5 rounded-xl ${card.color}`}>
                      <card.icon size={20} />
                   </div>
                   <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 tracking-tighter">
                      {card.trend}
                   </span>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
             </motion.div>
           ))}
        </div>

        {/* Center Visual Core */}
        <div className="lg:col-span-6">
           <div className="h-full rounded-[3rem] bg-white border border-slate-200 relative overflow-hidden flex flex-col p-10 shadow-2xl shadow-slate-200/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-wa-teal/5 blur-[100px] rounded-full" />
              
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-4 mb-auto">
                    <div className="w-14 h-14 rounded-2xl bg-wa-teal flex items-center justify-center text-white shadow-xl shadow-wa-teal/20 group-hover:rotate-12 transition-transform">
                       <Globe size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Network Hub</h2>
                       <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Global Control Interface</p>
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col justify-center items-center py-20">
                    <div className="relative">
                       <motion.div 
                         animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                         transition={{ repeat: Infinity, duration: 4 }}
                         className="absolute inset-[-40px] border-2 border-wa-teal/10 rounded-full" 
                       />
                       <div className="relative w-48 h-48 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-inner">
                          <div className="text-center">
                             <span className="block text-5xl font-black text-slate-900 tracking-tighter">99.9%</span>
                             <span className="text-[10px] font-black text-wa-teal uppercase tracking-[0.2em]">Stability</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector</p>
                       <p className="text-xl font-black text-slate-900 italic">AF-CMR</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nodes</p>
                       <p className="text-xl font-black text-slate-900">1.2k</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                       <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-black text-slate-900 uppercase">Secure</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right High Traffic Leaderboard */}
        <div className="lg:col-span-3">
           <div className="h-full rounded-[2.5rem] bg-white border border-slate-200 p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Leaders</h2>
                 <Layers size={16} className="text-slate-300" />
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 {stats.topStores?.map((store, i) => (
                   <div key={i} className="group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:bg-wa-teal group-hover:text-white transition-all">
                            0{i+1}
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 group-hover:text-wa-teal transition-colors truncate max-w-[120px]">{store.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{store.daily_views} IMPACT</p>
                         </div>
                      </div>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                   </div>
                 ))}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] text-center mb-2">Sync Consistency</p>
                 <div className="flex justify-center gap-1">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                       <motion.div animate={{ height: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }} className="w-full bg-wa-teal" />
                    </div>)}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Dynamic Operations Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         
         {/* Live Activity Ledger */}
         <section className="xl:col-span-7 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-slate-900 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Event Ledger</h2>
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} /> Real-time Feed
               </div>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
               {stats.activity?.map((log, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group/item"
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent transition-all ${
                      log.type === 'ORDER' 
                        ? 'bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-500 group-hover/item:text-white' 
                        : 'bg-blue-50 text-blue-600 group-hover/item:bg-blue-500 group-hover/item:text-white'
                    }`}>
                       {log.type === 'ORDER' ? <ShoppingBag size={20} /> : <Store size={20} />}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-black text-slate-700 group-hover/item:text-slate-900 transition-colors">{log.msg}</p>
                       <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.time).toLocaleTimeString('fr-FR')}</p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.type}</p>
                       </div>
                    </div>
                 </motion.div>
               ))}
               {(!stats.activity || stats.activity.length === 0) && (
                 <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Database size={32} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting system broadcast...</p>
                 </div>
               )}
            </div>
         </section>

         {/* Moderation Matrix HUD */}
         <section className="xl:col-span-5 space-y-6">
            <div className="flex items-center gap-4 px-4">
               <div className="w-2 h-6 bg-wa-teal rounded-full" />
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Authority Matrix</h2>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 space-y-6 shadow-sm">
               <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {recentStores.map((store, i) => (
                    <motion.div 
                      key={store.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm p-1">
                                {store.logo_url ? <img src={store.logo_url} className="w-full h-full object-cover rounded-xl" /> : <Store className="w-full h-full p-2.5 text-slate-300" />}
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900 group-hover:text-wa-teal transition-colors text-sm">{store.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{store.city || 'GLOBAL_ZONE'}</p>
                             </div>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${store.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                             {store.verified ? 'TRUSTED' : 'PENDING'}
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => toggleStoreStatus(store.id, store.verified)}
                            className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-wa-teal hover:text-black transition-all shadow-lg shadow-slate-900/10"
                          >
                             {store.verified ? 'Revoke Status' : 'Authorize'}
                          </button>
                          <button 
                            onClick={() => deleteStore(store.id)}
                            className="w-12 h-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                             <X size={18} />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
               <Link href="/admin/utilisateurs" className="block w-full text-center py-4 rounded-2xl bg-slate-100 hover:bg-slate-900 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                  Registry Access
               </Link>
            </div>
         </section>

      </div>
    </div>
  );
}
