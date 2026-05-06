'use client';
import { useState, useEffect } from 'react';
import { Users, Search, X, CheckCircle, Shield } from 'lucide-react';
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
    if (!confirm("ATTENTION : Voulez-vous vraiment bannir/supprimer cet utilisateur ? Son accès sera révoqué définitivement.")) return;
    const { error } = await deleteUserAction(userId);
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Erreur: " + error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div></div>;
  }

  return (
    <div className="flex-1 lg:ml-64 p-8 overflow-y-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-wa-teal" /> 
            Utilisateurs & Vendeurs
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Gérez tous les comptes inscrits sur la plateforme.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
             <input 
               type="text" 
               placeholder="Rechercher Email, ID..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-wa-teal transition-colors w-full md:w-64" 
             />
           </div>
        </div>
      </header>

      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900/50 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-700">
                <th className="px-6 py-4 font-medium">Email / Contact</th>
                <th className="px-6 py-4 font-medium">ID Système</th>
                <th className="px-6 py-4 font-medium">Date d'inscription</th>
                <th className="px-6 py-4 font-medium">Dernière Connexion</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-neutral-500 text-sm">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
                             <Users size={16} className="text-neutral-400" />
                         </div>
                         <div>
                            <div className="font-semibold text-white text-sm flex items-center gap-2">
                              {user.email || 'Email non fourni'}
                              {user.email_confirmed_at && <CheckCircle size={12} className="text-emerald-500" title="Email vérifié" />}
                            </div>
                            <div className="text-xs text-neutral-500">{user.phone || 'Pas de numéro'}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-400">
                      <div className="flex items-center gap-1"><Shield size={12}/> {user.id.split('-')[0]}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => deleteUser(user.id)}
                         className="text-neutral-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                         title="Supprimer définitivement l'utilisateur"
                       >
                         <X size={16} />
                       </button>
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
