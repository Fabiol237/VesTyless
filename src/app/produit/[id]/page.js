import { supabase } from '@/lib/supabase';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, price, stores(name)')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Produit Introuvable - VesTyle',
    };
  }

  const title = `${product.name} | ${product.stores?.name || 'VesTyle'}`;
  const description = `${product.price.toLocaleString()} FCFA - ${product.description?.slice(0, 150)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [product.image_url || '/icon-512.png'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image_url || '/icon-512.png'],
    },
  };
}

export default function ProductPage({ params }) {
  return <ProductClient params={params} />;
}
