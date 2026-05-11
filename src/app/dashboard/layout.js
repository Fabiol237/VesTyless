'use client';
import dynamic from 'next/dynamic';

const DashboardShell = dynamic(() => import('@/components/DashboardShell'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Initialisation du Dashboard...</p>
    </div>
  )
});

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
