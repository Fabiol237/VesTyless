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

export default async function ProductPage({ params }) {
  const { id } = await params;

  // Charger le produit et les variantes en parallèle côté serveur (beaucoup plus rapide)
  const [productRes, variantsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, stores(id,name,slug,logo_url,city)')
      .eq('id', id)
      .single(),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
  ]);

  return (
    <ProductClient 
      productId={id}
      initialProduct={productRes.data || null} 
      initialVariants={variantsRes.data || []} 
    />
  );
}
