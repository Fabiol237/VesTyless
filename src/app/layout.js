import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import PwaRegistry from '@/components/PwaRegistry';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata = {
  title: {
    default: 'VesTyle | Le Premier Marketplace de Proximité au Cameroun',
    template: '%s | VesTyle',
  },
  description: 'Achetez et vendez en toute simplicité. Découvrez les boutiques locales, commandez en un clic et suivez vos livraisons en temps réel. VesTyle : La mode et le commerce réinventés.',
  keywords: ['marketplace', 'Cameroun', 'achats en ligne', 'vêtements', 'boutiques locales', 'Douala', 'Yaoundé'],
  authors: [{ name: 'VesTyle Team' }],
  creator: 'VesTyle',
  publisher: 'VesTyle',
  applicationName: 'VesTyle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VesTyle',
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  openGraph: {
    title: 'VesTyle | Marketplace Cameroun',
    description: 'Le commerce de proximité réinventé pour le Cameroun.',
    url: 'https://vestyle.cm',
    siteName: 'VesTyle',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VesTyle | Marketplace Cameroun',
    description: 'Le commerce de proximité réinventé pour le Cameroun.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
  themeColor: '#111B21',
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <PwaRegistry />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}