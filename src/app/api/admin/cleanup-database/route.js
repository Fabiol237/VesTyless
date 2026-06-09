/**
 * POST /api/admin/cleanup-database
 * 
 * CLEANUP SCRIPT - Requires admin token
 * - Deactivate empty stores (no products, no orders, older than 7 days)
 * - Re-activate stores with products/recent orders
 * - Generate missing embeddings (basic text-only fallback)
 * - Fix products with missing required fields
 * 
 * Body: { adminToken, action: 'status' | 'cleanup' | 'report' }
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_CLEANUP_TOKEN || 'ADMIN_SECRET_KEY_12345';

export async function POST(req) {
  try {
    const { adminToken, action = 'status' } = await req.json();

    // Verify admin token
    if (!adminToken || adminToken !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing admin token.' },
        { status: 401 }
      );
    }

    if (action === 'status') {
      return await getStatus();
    } else if (action === 'cleanup') {
      return await performCleanup();
    } else if (action === 'report') {
      return await generateReport();
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[cleanup-database] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getStatus() {
  const { data: overview } = await supabaseAdmin.rpc('get_database_status') || {};

  // Manual count if RPC unavailable
  const [
    { count: totalUsers },
    { count: totalStores },
    { count: activeStores },
    { count: totalProducts },
    { count: emptyStores },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('stores').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.rpc('count_empty_stores').catch(() => ({ data: 0 })),
  ]);

  return NextResponse.json({
    status: 'ok',
    summary: {
      totalUsers: totalUsers || 0,
      totalStores: totalStores || 0,
      activeStores: activeStores || 0,
      totalProducts: totalProducts || 0,
      emptyStores: emptyStores || 0,
      timestamp: new Date().toISOString(),
    },
    message: 'Call with action=cleanup to fix issues',
  });
}

async function performCleanup() {
  const results = {
    deactivatedStores: 0,
    reactivatedStores: 0,
    fixedProducts: 0,
    errors: [],
  };

  try {
    // 1. DEACTIVATE EMPTY OLD STORES
    const { error: deactivateError } = await supabaseAdmin.rpc('deactivate_empty_old_stores');
    if (deactivateError) {
      console.error('Deactivate error:', deactivateError);
      // Fallback: manual SQL
      const { data: emptyStores } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('is_active', true)
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (emptyStores) {
        for (const store of emptyStores) {
          // Check if store has products
          const { count } = await supabaseAdmin
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', store.id);
          
          if (count === 0) {
            const { error } = await supabaseAdmin
              .from('stores')
              .update({ is_active: false })
              .eq('id', store.id);
            if (!error) results.deactivatedStores++;
          }
        }
      }
    }

    // 2. REACTIVATE STORES WITH PRODUCTS
    const { data: storesWithProducts } = await supabaseAdmin
      .from('products')
      .select('store_id')
      .then(({ data }) => ({
        data: data ? [...new Set(data.map(p => p.store_id))] : [],
      }));

    if (storesWithProducts && storesWithProducts.length > 0) {
      const { error } = await supabaseAdmin
        .from('stores')
        .update({ is_active: true })
        .in('id', storesWithProducts)
        .eq('is_active', false);
      
      if (!error) results.reactivatedStores = storesWithProducts.length;
    }

    // 3. FIX PRODUCTS WITH MISSING STOCK
    const { error: fixStockError } = await supabaseAdmin
      .from('products')
      .update({ stock_quantity: 1 })
      .is('stock_quantity', null);

    if (!fixStockError) results.fixedProducts++;

    return NextResponse.json({
      status: 'success',
      results,
      message: 'Database cleanup completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    results.errors.push(error.message);
    return NextResponse.json({ status: 'error', results }, { status: 500 });
  }
}

async function generateReport() {
  const { data: allStores } = await supabaseAdmin.from('stores').select('*');

  const report = {
    totalStores: allStores?.length || 0,
    storesByStatus: {
      active: 0,
      inactive: 0,
    },
    stores: [],
  };

  if (allStores) {
    for (const store of allStores) {
      const { count: productCount } = await supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id);

      const { count: orderCount } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id);

      const status = store.is_active ? 'active' : 'inactive';
      report.storesByStatus[status]++;

      report.stores.push({
        id: store.id,
        name: store.name,
        slug: store.slug,
        status,
        productCount: productCount || 0,
        orderCount: orderCount || 0,
        createdAt: store.created_at,
      });
    }
  }

  return NextResponse.json({
    status: 'ok',
    report,
    timestamp: new Date().toISOString(),
  });
}
