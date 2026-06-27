import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import LiveSalesPopup from '@/components/LiveSalesPopup';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'),
  title: {
    default: 'VesTyle | Le Premier Marketplace de Proximité au Cameroun',
    template: '%s | VesTyle',
  },
  description: 'Achetez et vendez en toute simplicité. Découvrez les boutiques locales, commandez en un clic et suivez vos livraisons en temps réel. VesTyle : La mode et le commerce réinventés.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VesTyle',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#128C7E',
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased system-fonts">
        <ClientProviders>
          {children}
          <LiveSalesPopup />
        </ClientProviders>
      </body>
    </html>
  );
}