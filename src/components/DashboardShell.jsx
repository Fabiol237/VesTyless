'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import VestyleSidebar from '@/components/Navigation/VestyleSidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardShell({ children }) {
  const { session, loading, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient || loading) return;
    const activeUser = session || user;

    if (!activeUser) {
      router.replace('/login');
    } else {
      setRoleChecked(true);
    }
  }, [session, user, loading, router, isClient]);

  useEffect(() => {
    const t = setTimeout(() => setRoleChecked(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!isClient || (loading && !roleChecked)) {
    return (
      <div className="min-h-screen vs-bg-page flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="vs-text-secondary text-xs font-semibold">Chargement de votre espace…</p>
      </div>
    );
  }

  if (session === null) return null;

  return (
    <div className="flex min-h-screen vs-bg-page vs-text-primary">
      <VestyleSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
