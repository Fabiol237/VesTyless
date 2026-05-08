'use client';
import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Shield, 
  Percent, 
  Globe, 
  Server, 
  Bell, 
  Cpu, 
  Zap,
  Layout,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  Mail,
  Coins
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getGlobalConfigAction, updateGlobalConfigAction } from '../actions';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    commission_rate: 15,
    maintenance_mode: false,
    platform_name: 'Vestyle PRO',
    currency: 'XAF',
    support_email: 'admin@vestyle.com',
    max_free_products: 10,
    ai_assistant_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      const data = await getGlobalConfigAction();
      if (data) setConfig(data);
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateGlobalConfigAction(config);
    setSaving(false);
    if (!error) {
      setMessage({ type: 'success', text: 'Paramètres système synchronisés avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Erreur de synchronisation : ' + error });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-200 border-t-wa-teal rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-wa-teal font-black text-xs uppercase tracking-[0.3em] mb-2"
          >
            <Cpu size={14} fill="currentColor" /> System Core
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Global <span className="text-slate-300">Parameters.</span>
          </h1>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-wa-teal hover:text-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Synchronisation...' : 'Appliquer les Changements'}
        </button>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl flex items-center gap-4 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
        >
           {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
           {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Economic Control */}
         <div className="xl:col-span-7 space-y-8">
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-wa-teal/10 text-wa-teal flex items-center justify-center">
                     <Percent size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Economic Rules</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Commission & Fees</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <p className="font-black text-slate-900 text-sm">Platform Commission (%)</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Prelevé sur chaque vente de boutique</p>
                     </div>
                     <input 
                       type="number" 
                       value={config.commission_rate}
                       onChange={(e) => setConfig({ ...config, commission_rate: e.target.value })}
                       className="w-full sm:w-32 bg-white border border-slate-200 text-slate-900 font-black text-center py-4 rounded-2xl focus:ring-2 focus:ring-wa-teal/50"
                     />
                  </div>
                  
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <p className="font-black text-slate-900 text-sm">Free Product Limit</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Nombre max de produits sans abonnement</p>
                     </div>
                     <input 
                       type="number" 
                       value={config.max_free_products}
                       onChange={(e) => setConfig({ ...config, max_free_products: e.target.value })}
                       className="w-full sm:w-32 bg-white border border-slate-200 text-slate-900 font-black text-center py-4 rounded-2xl focus:ring-2 focus:ring-wa-teal/50"
                     />
                  </div>
               </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                     <Layout size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Matrix</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Branding & Identity</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Platform Name</label>
                     <input 
                       type="text" 
                       value={config.platform_name}
                       onChange={(e) => setConfig({ ...config, platform_name: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-black px-6 py-4 rounded-2xl focus:bg-white transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Support Email</label>
                     <input 
                       type="email" 
                       value={config.support_email}
                       onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-black px-6 py-4 rounded-2xl focus:bg-white transition-all"
                     />
                  </div>
               </div>
            </section>
         </div>

         {/* System Switches */}
         <div className="xl:col-span-5 space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-wa-teal flex items-center justify-center text-black">
                     <Server size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tight">System State</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Engine Controls</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                     <div>
                        <p className="font-black text-sm">Maintenance Mode</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Stops all client-side interactions</p>
                     </div>
                     <button 
                       onClick={() => setConfig({ ...config, maintenance_mode: !config.maintenance_mode })}
                       className={`w-14 h-8 rounded-full relative transition-colors ${config.maintenance_mode ? 'bg-amber-500' : 'bg-slate-700'}`}
                     >
                        <motion.div 
                          animate={{ x: config.maintenance_mode ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        />
                     </button>
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                     <div>
                        <p className="font-black text-sm">WebLLM Assistant</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Enable AI Secretary for Stores</p>
                     </div>
                     <button 
                       onClick={() => setConfig({ ...config, ai_assistant_enabled: !config.ai_assistant_enabled })}
                       className={`w-14 h-8 rounded-full relative transition-colors ${config.ai_assistant_enabled ? 'bg-wa-teal' : 'bg-slate-700'}`}
                     >
                        <motion.div 
                          animate={{ x: config.ai_assistant_enabled ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        />
                     </button>
                  </div>
               </div>

               <div className="mt-10 p-6 rounded-3xl bg-wa-teal/10 border border-wa-teal/20 flex items-center gap-4">
                  <Zap size={24} className="text-wa-teal animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                     Any modification here affects the entire Vestyle network globally. Handle with root authority.
                  </p>
               </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden relative group">
               <div className="flex items-center gap-4 mb-6 relative z-10">
                  <Coins size={24} className="text-slate-400" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Default Currency</h3>
               </div>
               <div className="relative z-10 p-6 rounded-2xl bg-slate-50 border border-slate-100 font-black text-3xl text-slate-900 flex items-center justify-between">
                  {config.currency}
                  <Globe size={40} className="text-slate-200" />
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}
