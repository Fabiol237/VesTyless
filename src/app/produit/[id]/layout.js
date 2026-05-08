import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }) {
  const { id } = params;

  // Récupérer les infos du produit pour le SEO (WhatsApp / Facebook)
  const { data: product } = await supabase
    .from('products')
    .select('name, description, price, image_url')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Produit Introuvable | VesTyle',
    };
  }

  const title = `${product.name} - ${Number(product.price).toLocaleString()} FCFA`;
  const description = product.description || `Découvrez ${product.name} sur VesTyle. Qualité et prix garantis à proximité.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: product.image_url || '/placeholder-product.png',
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [product.image_url || '/placeholder-product.png'],
    },
  };
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}
