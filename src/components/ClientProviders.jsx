'use client';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import PwaRegistry from '@/components/PwaRegistry';

const OfflineSyncProvider = dynamic(() => import('@/components/OfflineSyncProvider'), { ssr: false });

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <OfflineSyncProvider>
        <CartProvider>
          <PwaRegistry />
          {children}
        </CartProvider>
      </OfflineSyncProvider>
    </AuthProvider>
  );
}
