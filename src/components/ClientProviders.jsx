'use client';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ActiveSiteProvider } from '@/core/context/ActiveSiteContext';
import { ThemeProvider } from '@/core/context/ThemeContext';
import PwaRegistry from '@/components/PwaRegistry';
import SecurityShield from '@/components/SecurityShield';
import ReactQueryProvider from '@/components/ReactQueryProvider';

const OfflineSyncProvider = dynamic(() => import('@/components/OfflineSyncProvider'), { ssr: false });
const DataHydrationProvider = dynamic(() => import('@/components/DataHydrationProvider'), { ssr: false });

// ── Filtrage automatique des alertes d'hydratation causées par les extensions de navigateur (ex: Bitdefender, Brave, AdBlock) ──
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('bis_skin_checked') ||
       args[0].includes('cz-shortcut-listen') ||
       args[0].includes('A tree hydrated but some attributes') ||
       args[0].includes('did not match. Server:'))
    ) {
      // Ignorer silencieusement les modifications du DOM injectées par les extensions de navigateur
      return;
    }
    originalError.apply(console, args);
  };
}

export default function ClientProviders({ children }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ActiveSiteProvider>
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
          </ActiveSiteProvider>
        </ThemeProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
