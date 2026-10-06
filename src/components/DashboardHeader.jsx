'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  LogOut, 
  Settings, 
  Bell, 
  Menu, 
  User, 
  ChevronDown, 
  Sparkles, 
  Globe,
  Plus
} from 'lucide-react';

export default function DashboardHeader({ onMenuClick }) {
  const { store, session, loading, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!store?.id) return;

    // 1. Initial fetch
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('is_read', false);
      if (!error) setUnreadCount(count || 0);
    };
    fetchUnreadCount();

    // 2. Realtime subscription
    const channel = supabase
      .channel(`header-notifs-${store.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `store_id=eq.${store.id}` 
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 vs-bg-sidebar border-b vs-border px-4 sm:px-8 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl vs-btn-secondary transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:block">
            <h2 className="text-sm sm:text-base font-bold vs-text-primary leading-tight truncate max-w-[160px] sm:max-w-none">
              {hasMounted ? (store?.name || 'Tableau de bord') : '...'}
            </h2>
            <p className="text-[10px] vs-text-secondary font-medium leading-none sm:leading-normal">Espace Marchand Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Raccourci Mes sites */}
          <Link
            href="/mes-sites"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 shadow-sm transition-all active:scale-95 flex-shrink-0"
            title="Gérer mes sites marchands"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mes sites</span>
            <span className="sm:hidden">Sites</span>
          </Link>

          {/* Toggle Thème */}
          <ThemeToggle />

          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            className="p-2 sm:p-2.5 rounded-xl vs-btn-secondary transition-all relative flex-shrink-0"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasMounted && unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
                {unreadCount > 9 ? '+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="h-6 w-[1px] vs-border border-r mx-0.5 hidden sm:block" />

          {/* Profil Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => hasMounted && setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 pr-2 sm:pr-3 rounded-2xl vs-btn-secondary transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                {hasMounted ? (session?.email?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />) : <User className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold vs-text-primary truncate max-w-[120px]">
                  {hasMounted ? session?.email : '...'}
                </p>
                <p className="text-[10px] vs-text-secondary font-medium leading-none">Administrateur</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 vs-text-muted transition-transform duration-300 ${hasMounted && showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {hasMounted && showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 vs-bg-card rounded-2xl shadow-2xl border vs-border p-2 z-20 overflow-hidden animate-fade-in">
                  <Link
                    href="/mes-sites"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-emerald-500 hover:vs-bg-input rounded-xl transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Mes Sites &amp; Designs</span>
                  </Link>
                  <Link
                    href="/creer-mon-site"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold vs-text-primary hover:vs-bg-input rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer un site</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold vs-text-secondary hover:vs-text-primary hover:vs-bg-input rounded-xl transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </Link>
                  <div className="h-[1px] vs-border border-b my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
