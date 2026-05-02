import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import PwaRegistry from '@/components/PwaRegistry';

export const metadata = {
  title: {
    default: 'VesTyle — Le Marketplace du Cameroun',
    template: '%s | VesTyle',
  },
  description: 'Découvrez les meilleures boutiques et produits du Cameroun. Commandez en ligne ou hors-ligne avec VesTyle.',
  applicationName: 'VesTyle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VesTyle',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'VesTyle',
    description: 'Le marketplace premium du Cameroun',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111B21',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <PwaRegistry />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}