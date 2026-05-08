'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  X, 
  CheckCircle, 
  Shield, 
  Filter, 
  ArrowUpRight, 
  MoreHorizontal, 
  Mail, 
  Clock, 
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchUsersAction, deleteUserAction } from '../actions';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const { data } = await searchUsersAction('');
      setUsers(data || []);
      setLoading(false);
    }
    loadUsers();
  }, []);

  useEffect(() => {
    if (loading) return;
    const delayDebounceFn = setTimeout(async () => {
      const { data } = await searchUsersAction(searchQuery);
      setUsers(data || []);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loading]);

  const deleteUser = async (userId) => {
    if (!confirm("BANNISSEMENT DÉFINITIF. Cette action révoquera tout accès à l'utilisateur. Confirmer ?")) return;
    const { error } = await deleteUserAction(userId);
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
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
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-wa-teal font-black text-xs uppercase tracking-[0.3em] mb-2"
          >
            <Shield size={14} fill="currentColor" /> Authority Matrix
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            User <span className="text-slate-300">Directory.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-wa-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Email, ID, Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 text-sm text-slate-600 rounded-2xl pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-wa-teal/50 focus:border-wa-teal transition-all w-full md:w-80 shadow-sm" 
            />
          </div>
          <button className="bg-white border border-slate-200 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400">
             <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Users Table */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
                <th className="px-8 py-6">UTILISATEUR</th>
                <th className="px-8 py-6">ID SYSTÈME</th>
                <th className="px-8 py-6">CONTACT</th>
                <th className="px-8 py-6">DERNIÈRE CONNEXION</th>
                <th className="px-8 py-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">AUCUN UTILISATEUR TROUVÉ</td></tr>
                ) : (
                  users.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-wa-teal shadow-sm group-hover:scale-110 transition-transform">
                               {user.email?.[0].toUpperCase()}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-sm">{user.email?.split('@')[0]}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Node</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{user.id.slice(0, 18)}...</td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {user.email}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Network Access OK</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                            <Clock size={14} className="text-slate-300" />
                            {new Date(user.last_sign_in_at).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <X size={18} />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                               <MoreHorizontal size={18} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2rem] bg-wa-teal/5 border border-wa-teal/10 flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-wa-teal flex items-center justify-center text-white shadow-lg shadow-wa-teal/20 group-hover:scale-110 transition-transform">
                 <Users size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-wa-teal uppercase tracking-[0.2em] mb-1">Total Network</p>
                 <h3 className="text-3xl font-black text-slate-900">{users.length}</h3>
              </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                 <CheckCircle size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Active Nodes</p>
                 <h3 className="text-3xl font-black text-slate-900">{users.length}</h3>
              </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center gap-6 group relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform relative z-10">
                 <UserPlus size={32} />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">New Syncs</p>
                 <h3 className="text-3xl font-black text-slate-900">+12</h3>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Shield size={60} />
              </div>
          </div>
      </div>
    </div>
  );
}
