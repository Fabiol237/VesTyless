import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Params :
 *   storeId  – filtrer par boutique (pour le Builder et DataHydrationProvider)
 *   limit    – nombre max (défaut 20)
 *   sort     – 'popular' | 'recent' (défaut 'recent')
 *   category – filtrer par catégorie
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId  = searchParams.get('storeId');
    const limit    = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const sort     = searchParams.get('sort') || 'recent';
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('id, name, price, image_url, description, category, category_name, stock, is_active, is_boosted, is_promo, daily_views, store_id, created_at')
      .eq('is_active', true)
      .limit(limit);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (sort === 'popular') {
      query = query
        .order('is_boosted', { ascending: false })
        .order('daily_views', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('[/api/products] Supabase error:', error.message);
      return NextResponse.json({ products: [], total: 0 }, { status: 200 });
    }

    const products = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      title: p.name,
      price: p.price,
      old_price: p.old_price,
      image_url: p.image_url,
      image: p.image_url,
      description: p.description || '',
      category: p.category || p.category_name || 'Boutique',
      stock: p.stock ?? null,
      store_id: p.store_id,
      is_active: p.is_active,
      is_boosted: p.is_boosted,
      is_promo: p.is_promo,
    }));

    return NextResponse.json(
      { products, total: products.length, success: true },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (err) {
    console.error('[/api/products] Exception:', err);
    return NextResponse.json({ products: [], total: 0, success: false }, { status: 200 });
  }
}
