'use client';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import PwaRegistry from '@/components/PwaRegistry';
import SecurityShield from '@/components/SecurityShield';
import ReactQueryProvider from '@/components/ReactQueryProvider';

const OfflineSyncProvider = dynamic(() => import('@/components/OfflineSyncProvider'), { ssr: false });

export default function ClientProviders({ children }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <CartProvider>
          <OfflineSyncProvider>
            <PwaRegistry />
            <SecurityShield />
            {children}
          </OfflineSyncProvider>
        </CartProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
