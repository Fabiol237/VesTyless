const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRPC() {
  console.log('🔍 TEST FONCTION RPC\n');

  // 1. Récupérer un produit avec un embedding
  const { data: product } = await supabase
    .from('products')
    .select('id, name, text_embedding_1024')
    .limit(1)
    .single();

  if (!product || !product.text_embedding_1024) {
    console.log('❌ Aucun produit avec embedding trouvé');
    return;
  }

  console.log(`✅ Produit trouvé: ${product.name}`);
  console.log(`📊 Dimensions embedding: ${product.text_embedding_1024.length}\n`);

  // 2. Tester la RPC avec ce produit comme query
  console.log('🔍 Appel RPC: match_products_v2...\n');

  try {
    const { data: results, error } = await supabase.rpc('match_products_v2', {
      query_embedding: product.text_embedding_1024,
      match_threshold: 0.40,
      match_count: 10
    });

    if (error) {
      console.log('❌ ERREUR RPC:', error.message);
      console.log('\n📝 Solution: Appliquer la migration en Supabase SQL Editor:');
      console.log('   Fichier: supabase/migrate_to_cohere_1024.sql');
      return;
    }

    console.log(`✅ RPC réussie! ${results.length} produit(s) trouvé(s)\n`);
    console.log('📋 Résultats:');
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (similarity: ${r.similarity.toFixed(2)})`);
    });

  } catch (e) {
    console.log('❌ Erreur lors de l\'appel RPC:');
    console.log('   ' + e.message);
    console.log('\n🔧 Solution possible:');
    console.log('   1. Va dans Supabase SQL Editor');
    console.log('   2. Exécute le fichier: supabase/migrate_to_cohere_1024.sql');
    console.log('   3. Redémarre le serveur');
  }
}

testRPC().catch(console.error);
