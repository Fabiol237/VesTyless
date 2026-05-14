import { supabase } from '@/lib/supabase';
import StorefrontClient from './StorefrontClient';

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  const { data: store } = await supabase
    .from('stores')
    .select('name, description, logo_url, city')
    .eq('slug', slug)
    .single();

  if (!store) {
    return {
      title: 'Boutique Introuvable - VesTyle',
    };
  }

  return {
    title: `${store.name} | Boutique Officielle sur VesTyle`,
    description: store.description || `Découvrez la boutique ${store.name} à ${store.city}. Commandez en ligne sur VesTyle Pro.`,
    openGraph: {
      title: store.name,
      description: store.description,
      images: [store.logo_url || '/icon-512.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: store.description,
      images: [store.logo_url || '/icon-512.png'],
    },
  };
}

export default function StorePage({ params }) {
  return <StorefrontClient params={params} />;
}
