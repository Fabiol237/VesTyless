#!/usr/bin/env node
/**
 * CLEANUP SCRIPT FOR VESTYLE DATABASE
 * Usage: node cleanup_database.js
 * 
 * - Désactive les vieilles boutiques vides
 * - Réactive les boutiques avec produits/commandes
 * - Corrige les produits cassés
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Ajoute à .env.local:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function cleanup() {
  console.log('\n🔧 CLEANUP VESTYLE DATABASE\n');
  console.log('='.repeat(60));

  try {
    // 1. SHOW BEFORE
    console.log('\n📊 ÉTAT AVANT NETTOYAGE:');
    const { count: totalStores } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true });
    const { count: activeStores } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    const { count: inactiveStores } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', false);
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true });

    console.log(`  • Total stores: ${totalStores}`);
    console.log(`  • Active stores: ${activeStores}`);
    console.log(`  • Inactive stores: ${inactiveStores}`);
    console.log(`  • Total products: ${totalProducts}`);

    // 2. DEACTIVATE ALL STORES WITHOUT PRODUCTS OR RECENT ORDERS
    console.log('\n🗑️  Désactivation des boutiques vides (no products, no recent orders)...');
    
    const { error: deactivateError } = await supabaseAdmin
      .from('stores')
      .update({ is_active: false })
      .eq('is_active', true)
      .not('id', 'in', `(${(await supabaseAdmin.from('products').select('store_id')).data?.map(p => `'${p.store_id}'`).join(',') || 'null'})`);

    // Fallback: manual loop (more reliable)
    console.log('  (Using manual verification for reliability)');
    const { data: allActiveStores } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('is_active', true);

    let deactivatedCount = 0;

    if (allActiveStores && allActiveStores.length > 0) {
      for (const { id: storeId } of allActiveStores) {
        const { count: productCount } = await supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeId);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: recentOrderCount } = await supabaseAdmin
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeId)
          .gt('created_at', thirtyDaysAgo);

        // Deactivate if no products AND no recent orders
        if ((productCount || 0) === 0 && (recentOrderCount || 0) === 0) {
          await supabaseAdmin
            .from('stores')
            .update({ is_active: false })
            .eq('id', storeId);
          deactivatedCount++;
        }
      }
    }

    console.log(`  ✅ ${deactivatedCount} boutiques désactivées`);

    // 3. REACTIVATE STORES WITH PRODUCTS
    console.log('\n✅ Réactivation des boutiques avec produits...');
    const { data: storesWithProducts } = await supabaseAdmin
      .from('products')
      .select('store_id(id)')
      .then(({ data }) => ({
        data: data ? [...new Set(data.map(p => p.store_id))] : [],
      }));

    if (storesWithProducts && storesWithProducts.length > 0) {
      await supabaseAdmin
        .from('stores')
        .update({ is_active: true })
        .in('id', storesWithProducts)
        .eq('is_active', false);
      console.log(`  ✅ ${storesWithProducts.length} boutiques réactivées`);
    }

    // 4. FIX NULL STOCK
    console.log('\n🔧 Correction des produits sans stock...');
    const { count: fixedProducts } = await supabaseAdmin
      .from('products')
      .update({ stock_quantity: 1 })
      .is('stock_quantity', null);

    console.log(`  ✅ ${fixedProducts || 0} produits corrigés`);

    // 5. SHOW AFTER
    console.log('\n📊 ÉTAT APRÈS NETTOYAGE:');
    const { count: totalStores2 } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true });
    const { count: activeStores2 } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    const { count: inactiveStores2 } = await supabaseAdmin
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', false);

    console.log(`  • Total stores: ${totalStores2}`);
    console.log(`  • Active stores: ${activeStores2}`);
    console.log(`  • Inactive stores: ${inactiveStores2}`);

    // 6. SHOW ACTIVE STORES
    console.log('\n📍 BOUTIQUES ACTIVES (affichées sur /boutiques):');
    const { data: activeStoresList } = await supabaseAdmin
      .from('stores')
      .select('id, name, slug, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeStoresList && activeStoresList.length > 0) {
      activeStoresList.forEach((store, idx) => {
        console.log(`  ${idx + 1}. ${store.name} (${store.slug})`);
      });
    } else {
      console.log('  ⚠️  Aucune boutique active trouvée');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ NETTOYAGE TERMINÉ!\n');
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  }
}

cleanup();
