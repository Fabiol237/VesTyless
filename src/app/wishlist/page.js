'use client';
import Navbar from '@/components/Navbar';
import WishlistPanel from '@/components/WishlistPanel';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <WishlistPanel />
      </div>
    </div>
  );
}
