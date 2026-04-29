'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Wrap pour les pages où une session est obligatoire (Checkout, Vendeur basique)
export default function DashboardLayout({ children }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session === null) {
      router.push('/login');
    }
  }, [session, loading, router]);

  if (loading) {
    return <div className="min-h-screen bg-wa-bg flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div></div>;
  }

  if (session === null) {
    return null; // évitera le flickering
  }

  return (
    <div className="min-h-screen bg-wa-bg font-sans">
      {children}
    </div>
  );
}
