'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && session === null) {
      router.replace('/login');
    }
  }, [session, loading, router]);

  // Don't render the dashboard if there's no session and we're done loading (redirect is in progress)
  if (!loading && session === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
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
