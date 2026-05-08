'use client';
// Force Refresh Version: 2026-05-08-T18-07-00
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Force client-side only render with a NEW path to break any cache
const VestyleSidebar = dynamic(() => import('@/components/Navigation/VestyleSidebar'), { 
  ssr: false,
  loading: () => (
    <div className="relative">
      <div className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 border-r border-gray-100 bg-white animate-pulse" />
    </div>
  )
});

export default function DashboardLayout({ children }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && session === null) {
      router.replace('/login');
    }
  }, [session, loading, router]);

  if (!loading && session === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VestyleSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center pt-20">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
              <p className="text-gray-400 font-medium">Chargement de votre espace...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
