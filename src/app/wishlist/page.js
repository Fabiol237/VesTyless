'use client';
import Navbar from '@/components/Navbar';
import BackNavigation from '@/components/BackNavigation';
import WishlistPanel from '@/components/WishlistPanel';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <BackNavigation title="Mes Favoris" />
        <WishlistPanel />
      </div>
    </div>
  );
}
