const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function testProductSearch() {
  console.log('🔍 TEST DE RECHERCHE PRODUITS\n');

  // 1. Récupérer tous les produits
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, text_embedding_1024')
    .order('created_at', { ascending: false })
    .limit(20);

  console.log(`📦 Total produits testés: ${allProducts.length}\n`);

  // 2. Tester quelques requêtes de recherche
  const searchQueries = [
    'chemise blanche',
    'robe de soirée',
    'pantalon noir',
    't-shirt coton',
    'vêtements mode',
  ];

  for (const query of searchQueries) {
    console.log(`\n🔎 Recherche: "${query}"`);
    
    try {
      // Générer embedding pour la recherche
      const embedResult = await cohere.embed({
        texts: [query],
        model: 'embed-english-v3.0',
        inputType: 'search_query',
      });

      const queryEmbedding = embedResult.embeddings[0];

      // Appeler la RPC
      const { data: results, error } = await supabase.rpc('match_products_v2', {
        query_embedding: queryEmbedding,
        match_threshold: 0.40,
        match_count: 5
      });

      if (error) {
        console.log(`   ❌ Erreur RPC: ${error.message}`);
        continue;
      }

      if (results.length === 0) {
        console.log(`   ⚠️  Aucun résultat`);
      } else {
        console.log(`   ✅ ${results.length} résultat(s):`);
        results.forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.name} (pertinence: ${(r.similarity * 100).toFixed(0)}%)`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
    }
  }

  console.log('\n✨ TEST TERMINÉ');
}

testProductSearch().catch(console.error);
