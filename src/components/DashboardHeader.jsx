"use client";
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, Bell, Menu, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardHeader({ onMenuClick }) {
  const { store, session, loading, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col sm:block">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-none">
              {store?.name || 'Dashboard'}
            </h2>
            <p className="text-[10px] text-gray-500 font-medium leading-none sm:leading-normal">Espace vendeur Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/dashboard/notifications"
            className="p-2.5 text-gray-400 hover:text-wa-teal-dark hover:bg-wa-chat rounded-xl transition-all relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </Link>

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-wa-teal to-wa-green rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                {session?.email?.charAt(0)?.toUpperCase() || <User size={18} />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                  {session?.email}
                </p>
                <p className="text-[10px] text-gray-500 font-medium leading-none">Administrateur</p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <div>
              {showProfileMenu && (
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
                      <Settings size={18} />
                      Paramètres
                    </Link>
                    <div className="h-[1px] bg-gray-50 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut size={18} />
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
