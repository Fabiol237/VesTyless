import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// ── SVG Icons ──────────────────────────────────────────────
const LogOutIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const SettingsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
const BellIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const MenuIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const ChevronDownIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

export default function DashboardHeader({ onMenuClick }) {
  const { store, session, loading, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Ne plus retourner null, rendre le header même côté serveur pour la structure

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <MenuIcon size={24} />
          </button>

          <div className="flex flex-col sm:block">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-none">
              {hasMounted ? (store?.name || 'Dashboard') : '...'}
            </h2>
            <p className="text-[10px] text-gray-500 font-medium leading-none sm:leading-normal">Espace vendeur Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard/notifications"
            className="p-2.5 text-gray-400 hover:text-wa-teal-dark hover:bg-wa-chat rounded-xl transition-all relative"
          >
            <BellIcon size={20} />
            {hasMounted && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
          </Link>

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

          <div className="relative">
            <button
              onClick={() => hasMounted && setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-wa-teal to-wa-green rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                {hasMounted ? (session?.email?.charAt(0)?.toUpperCase() || <UserIcon size={18} />) : <UserIcon size={18} />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                  {hasMounted ? session?.email : '...'}
                </p>
                <p className="text-[10px] text-gray-500 font-medium leading-none">Administrateur</p>
              </div>
              <ChevronDownIcon size={14} className={`text-gray-400 transition-transform duration-300 ${hasMounted && showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <div>
              {hasMounted && showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-20 overflow-hidden"
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-wa-teal-dark rounded-xl transition-all"
                    >
                      <SettingsIcon size={18} />
                      Paramètres
                    </Link>
                    <div className="h-[1px] bg-gray-50 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOutIcon size={18} />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
