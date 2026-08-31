'use client';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import PwaRegistry from '@/components/PwaRegistry';
import SecurityShield from '@/components/SecurityShield';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';

const OfflineSyncProvider = dynamic(() => import('@/components/OfflineSyncProvider'), { ssr: false });
const DataHydrationProvider = dynamic(() => import('@/components/DataHydrationProvider'), { ssr: false });

export default function ClientProviders({ children }) {
  return (
    <GlobalErrorBoundary>
      <ReactQueryProvider>
        <AuthProvider>
          <CartProvider>
            <OfflineSyncProvider>
              {/* DataHydrationProvider pré-charge boutiques/produits dans Dexie au 1er chargement */}
              <DataHydrationProvider>
                <PwaRegistry />
                <SecurityShield />
                {children}
              </DataHydrationProvider>
            </OfflineSyncProvider>
          </CartProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </GlobalErrorBoundary>
  );
}
