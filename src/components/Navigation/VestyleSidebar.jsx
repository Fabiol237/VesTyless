'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  X, 
  ExternalLink, 
  ChevronRight
} from 'lucide-react';

export default function VestyleSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { store } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: 'Vue d’ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produits', href: '/dashboard/products', icon: Package },
    { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-wa-teal/20 group-hover:scale-105 transition-transform">
            <img src="/icon-512.png" className="w-full h-full object-cover" alt="Vestyle Logo" />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900 uppercase">VesTyle</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => onClose && onClose()}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-wa-teal text-white shadow-xl shadow-wa-teal/20' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-wa-teal'} transition-colors`} />
                <span className="font-semibold text-sm">{link.name}</span>
              </div>
              {isActive && (
                <div>
                  <ChevronRight size={14} className="text-white/70" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {store?.slug && (
        <div className="p-4 mt-auto border-t border-gray-50">
          <Link
            href={`/boutique/${store.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all hover:shadow-xl active:scale-95"
          >
            <ExternalLink size={16} />
            <span>Ma Boutique</span>
          </Link>
        </div>
      )}
    </div>
  );

  // Note: Root <div> is matches the 'loading' component in dashboard/layout.js
  return (
    <div className="relative">
      <div className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 border-r border-gray-200 bg-white">
        {mounted ? sidebarContent : null}
      </div>

      {mounted && isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </div>
  );
}
