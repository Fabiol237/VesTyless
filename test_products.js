const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProducts() {
  console.log('🔍 DIAGNOSTIC PRODUITS\n');

  // 1. Tous les produits
  const { data: allProducts, error: err1 } = await supabase
    .from('products')
    .select('id, name, global_category_id, store_id, text_embedding_1024')
    .limit(50);

  if (err1) {
    console.error('❌ Erreur fetch produits:', err1);
    return;
  }

  console.log(`📊 TOTAL PRODUITS: ${allProducts.length}\n`);

  // 2. Produits avec embeddings
  const withEmbed = allProducts.filter(p => p.text_embedding_1024 && p.text_embedding_1024.length > 0);
  const withoutEmbed = allProducts.filter(p => !p.text_embedding_1024 || p.text_embedding_1024.length === 0);

  console.log(`✅ Avec embeddings: ${withEmbed.length}`);
  console.log(`❌ SANS embeddings: ${withoutEmbed.length}\n`);

  if (withoutEmbed.length > 0) {
    console.log('🔴 PRODUITS SANS EMBEDDINGS:');
    withoutEmbed.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });
    console.log();
  }

  // 3. Catégories utilisées
  const { data: categories } = await supabase
    .from('products')
    .select('global_category_id')
    .neq('global_category_id', null)
    .limit(1);

  if (categories && categories.length > 0) {
    const { data: catNames } = await supabase
      .from('global_categories')
      .select('id, name')
      .in('id', [...new Set(allProducts.map(p => p.global_category_id).filter(Boolean))]);
    
    console.log('📂 CATÉGORIES UTILISÉES:');
    catNames?.forEach(c => console.log(`   - ${c.name} (${c.id})`));
    console.log();
  }

  // 4. Boutiques propriétaires
  const storeIds = [...new Set(allProducts.map(p => p.store_id))];
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, owner_id')
    .in('id', storeIds);

  console.log('🏪 BOUTIQUES PROPRIÉTAIRES:');
  stores?.forEach(s => console.log(`   - ${s.name} (ID: ${s.id})`));
  console.log();

  // 5. Derniers produits ajoutés
  const { data: recent } = await supabase
    .from('products')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('⏱️  DERNIERS PRODUITS AJOUTÉS:');
  recent?.forEach(p => console.log(`   - ${p.name} (${new Date(p.created_at).toLocaleString()})`));

  console.log('\n✅ DIAGNOSTIC TERMINÉ');
}

testProducts().catch(console.error);
