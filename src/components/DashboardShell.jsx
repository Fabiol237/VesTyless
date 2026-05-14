'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import DashboardHeader from '@/components/DashboardHeader';
import dynamic from 'next/dynamic';

const Loader2Icon = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" />
    <path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" />
  </svg>
);

const DashboardSidebar = dynamic(() => import('@/components/Navigation/VestyleSidebar'), { 
  ssr: false,
  loading: () => <div className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 border-r border-gray-200 bg-white" />
});

export default function DashboardShell({ children }) {
  const { session, loading, store } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    // Non connecté → login
    if (session === null) {
      router.replace('/login');
      return;
    }

    // Vérifier le rôle : si c'est un livreur pur → rediriger vers son espace dédié
    if (session?.id) {
      supabase
        .from('livreurs')
        .select('id')
        .eq('user_id', session.id)
        .maybeSingle()
        .then(({ data }) => {
          // Si c'est un livreur ET qu'il n'a pas de boutique active, on le redirige
          if (data && !store) {
            router.replace('/delivery');
          } else {
            // C'est soit un vendeur pur, soit un vendeur-livreur
            setRoleChecked(true);
          }
        });
    }
  }, [session, loading, router, store, isClient]);

  if (!isClient || loading || !roleChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2Icon className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-gray-400 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  if (session === null) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
