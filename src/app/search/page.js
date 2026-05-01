'use client';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDiscovery from '@/components/ClientDiscovery';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-8 pt-8">
        <h1 className="text-3xl font-bold text-wa-teal-dark mb-4">
          Résultats pour &quot;{query}&quot;
        </h1>
      </div>
      <ClientDiscovery initialSearchQuery={query} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-wa-bg flex flex-col">
      <Navbar />
      
      <div className="pt-20 flex-1 bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.08)] mt-8">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
