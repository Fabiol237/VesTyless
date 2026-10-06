'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Globe, 
  Plus, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  X, 
  ExternalLink, 
  ChevronRight,
  Truck,
  Sparkles,
  HelpCircle,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';

export default function VestyleSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { store } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLivreur, setIsLivreur] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.id) {
      const checkLivreur = async () => {
        const { data } = await supabase.from('livreurs').select('id').eq('user_id', session.id).maybeSingle();
        if (data) setIsLivreur(true);
      };
      checkLivreur();
    }
  }, [session]);

  const links = [
    { name: 'Vue d’ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mes sites', href: '/mes-sites', icon: Globe },
    { name: 'Créer un site', href: '/creer-mon-site', icon: Plus },
    { name: 'Produits', href: '/dashboard/products', icon: Package },
    { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  ];

  const sidebarInner = (
    <div className="flex flex-col h-full vs-bg-sidebar justify-between p-5 overflow-y-auto">
      {/* Haut : Logo + Liens */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <Link href="/" onClick={() => onClose && onClose()} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <img src="/vestyle-logo.png" className="w-full h-full object-contain" alt="VesTyle Logo" />
            </div>
            <span className="text-xl font-black tracking-tight vs-text-primary uppercase">
              Ves<span style={{ color: 'var(--accent-green)' }}>Tyle</span>
            </span>
          </Link>

          {/* Bouton de fermeture sur mobile */}
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 rounded-xl vs-btn-secondary transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href === '/mes-sites' && pathname?.startsWith('/mes-sites'));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => onClose && onClose()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'vs-sidebar-link-active font-bold shadow-sm' 
                    : 'vs-sidebar-link hover:vs-bg-input'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? 'text-emerald-500' 
                      : 'vs-text-muted group-hover:vs-text-primary'
                  } transition-colors`} />
                  <span>{link.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </Link>
            );
          })}

          {isLivreur && (
            <Link
              href="/delivery"
              onClick={() => onClose && onClose()}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                pathname === '/delivery'
                  ? 'vs-sidebar-link-active font-bold shadow-sm' 
                  : 'vs-sidebar-link hover:vs-bg-input'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`w-4 h-4 ${pathname === '/delivery' ? 'text-emerald-500' : 'vs-text-muted'}`} />
                <span>Hub Livreur</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* Bas : Widget Créer mon site + Aide + Boutique */}
      <div className="space-y-3 pt-4 border-t vs-border mt-4">
        {/* Widget CTA Promotionnel */}
        <div className="vs-sidebar-cta-card relative rounded-2xl p-4 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src="/vestyle-logo.png"
              alt="VesTyle"
              className="w-5 h-5 rounded-md object-contain shadow-sm"
            />
            <h4 className="text-xs font-bold vs-sidebar-cta-title leading-tight">
              Créer mon site
            </h4>
          </div>
          <p className="text-[10px] vs-sidebar-cta-text mb-3 leading-snug">
            Lancez votre vitrine en 5 minutes chrono !
          </p>
          <Link
            href="/creer-mon-site"
            onClick={() => onClose && onClose()}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau site</span>
          </Link>
        </div>

        {/* Lien Besoin d'aide */}
        <Link
          href="/faq"
          onClick={() => onClose && onClose()}
          className="flex items-center justify-between px-3 py-2 text-xs font-medium vs-text-secondary hover:vs-text-primary transition-colors rounded-xl hover:vs-bg-input border vs-border"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold block vs-text-primary text-[11px]">Besoin d'aide ?</span>
              <span className="text-[9px] vs-text-muted">Centre d'assistance</span>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 vs-text-muted" />
        </Link>

        {/* Bouton Ma Boutique si présent */}
        {store?.slug && (
          <Link
            href={`/boutique/${store.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 vs-btn-secondary text-xs font-bold rounded-xl transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir ma boutique</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixe */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 vs-border border-r vs-bg-sidebar z-30">
        {mounted ? sidebarInner : null}
      </aside>

      {/* Drawer Mobile Coulissant */}
      {mounted && isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full vs-bg-sidebar shadow-2xl border-r vs-border z-10 animate-in slide-in-from-left duration-200">
            {sidebarInner}
          </div>
        </div>
      )}
    </>
  );
}
