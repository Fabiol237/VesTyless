import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forcer le cache au niveau du serveur Next.js (revalidation toutes les 60 secondes)
export const revalidate = 60; 

export async function GET() {
  try {
    // 1. Récupération des produits populaires / actifs
    const prodRes = await supabase
      .from('products')
      .select('id, name, price, image_url, created_at, global_category_id, is_active, is_boosted, is_promo, daily_views, stores(id, name, slug, logo_url, city, latitude, longitude), global_categories(name, icon)')
      .eq('is_active', true)
      .order('is_boosted', { ascending: false })
      .order('is_promo', { ascending: false })
      .order('daily_views', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (prodRes.error) throw prodRes.error;

    // 2. Récupération des ID des boutiques actives
    const storeIds = [...new Set((prodRes.data || []).map(p => p.store_id || (p.stores && p.stores.id)))].filter(Boolean);
    
    let stores = [];
    if (storeIds.length > 0) {
      const sd = await supabase
        .from('stores')
        .select('id, name, slug, logo_url, city, is_boosted, daily_views, latitude, longitude')
        .in('id', storeIds)
        .order('is_boosted', { ascending: false })
        .order('daily_views', { ascending: false });
      stores = sd.data || [];
    }

    // 3. Catégories
    const catRes = await supabase
      .from('global_categories')
      .select('*')
      .is('parent_id', null)
      .order('name');

    const normalizedProds = (prodRes.data || []).map(p => ({
      ...p,
      category: p.global_categories?.name || 'Autre',
    }));

    // Préparer la réponse
    const responseData = {
      products: normalizedProds,
      stores,
      categories: catRes.data || []
    };

    // Envoyer la réponse avec des en-têtes de cache HTTP pour les navigateurs et les CDN (Vercel Edge Network)
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache partagé (CDN) pendant 60 secondes, et tolère de servir une version périmée pendant la revalidation
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching feed cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
