import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forcer le cache au niveau du serveur Next.js (revalidation toutes les 60 secondes)
export const revalidate = 60; 

export async function GET() {
  try {
    // 1. Récupération des produits populaires / actifs avec jointures complètes
    const { data: productsData, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, old_price, image_url, created_at, global_category_id, is_active, is_boosted, is_promo, daily_views, store_id, stores(id, name, slug, logo_url, city, latitude, longitude), global_categories(name, icon)')
      .eq('is_active', true)
      .order('is_boosted', { ascending: false })
      .order('is_promo', { ascending: false })
      .order('daily_views', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    let products = productsData || [];

    // Fallback si la jointure stricte échoue en raison de la structure Supabase
    if (prodErr || !products.length) {
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);
      products = fallbackData || [];
    }

    // 2. Récupération des boutiques
    const storeIds = [...new Set(products.map(p => p.store_id || p.stores?.id))].filter(Boolean);
    let stores = [];
    if (storeIds.length > 0) {
      const { data: sd } = await supabase
        .from('stores')
        .select('id, name, slug, logo_url, city, is_boosted, daily_views, latitude, longitude')
        .in('id', storeIds);
      stores = sd || [];
    }

    // 3. Catégories globales
    const { data: catData } = await supabase
      .from('global_categories')
      .select('*')
      .is('parent_id', null)
      .order('name');

    const normalizedProds = products.map(p => ({
      ...p,
      category: p.global_categories?.name || p.category || 'Autre',
      stores: p.stores || stores.find(s => s.id === p.store_id) || null,
    }));

    const responseData = {
      products: normalizedProds,
      stores,
      categories: catData || []
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('[Feed API Exception]:', err);
    return new NextResponse(JSON.stringify({ products: [], stores: [], categories: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
