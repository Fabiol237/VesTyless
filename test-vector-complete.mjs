#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVectorSearch() {
  try {
    console.log('🧪 TEST COMPLET DE LA RECHERCHE VECTORIELLE\n');
    
    // 1) Vérifier que tous les produits ont des embeddings
    const { data: products } = await supabase
      .from('products')
      .select('id, name, text_embedding_1024');
    
    const withEmbed = products.filter(p => p.text_embedding_1024).length;
    const total = products.length;
    
    console.log(`1️⃣ ÉTAT DES EMBEDDINGS: ${withEmbed}/${total} produits`);
    if (withEmbed === total) {
      console.log('   ✅ Tous les produits ont des embeddings\n');
    } else {
      console.log(`   ⚠️  ${total - withEmbed} produits sans embeddings\n`);
    }
    
    // 2) Vérifier les 7 catégories
    const { data: categories } = await supabase
      .from('global_categories')
      .select('id, name')
      .order('name');
    
    console.log(`2️⃣ CATÉGORIES (${categories.length}/7):`);
    categories.forEach(cat => console.log(`   ✅ ${cat.name}`));
    console.log();
    
    // 3) Vérifier la distribution des produits par catégorie
    console.log('3️⃣ DISTRIBUTION DES PRODUITS:');
    const { data: prodsByCategory } = await supabase
      .from('products')
      .select('id, global_category_id, global_categories(name)');
    
    const grouped = {};
    prodsByCategory.forEach(p => {
      const catName = p.global_categories?.name || 'SANS CATÉGORIE';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(p.id);
    });
    
    Object.entries(grouped).forEach(([cat, ids]) => {
      const icon = cat === 'SANS CATÉGORIE' ? '⚠️' : '✅';
      console.log(`   ${icon} ${cat}: ${ids.length} produits`);
    });
    console.log();
    
    // 4) Test du RPC avec une recherche réelle
    console.log('4️⃣ TEST DU RPC (recherche "vêtement"):');
    
    const testEmbedding = Array(1024).fill(0.1);
    const { data: results, error: rpcErr } = await supabase.rpc('match_products_v2', {
      query_embedding: testEmbedding,
      match_threshold: 0.0,
      match_count: 5
    });
    
    if (rpcErr) {
      console.log(`   ❌ RPC Error: ${rpcErr.message}`);
    } else if (results && results.length > 0) {
      console.log(`   ✅ ${results.length} résultats trouvés:`);
      results.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i+1}. ${r.name} (similarité: ${(r.similarity * 100).toFixed(1)}%)`);
      });
    } else {
      console.log('   ⚠️  Aucun résultat trouvé');
    }
    
    console.log('\n✅ DIAGNOSTIC COMPLÉTÉ');
    console.log('📝 RÉSUMÉ:');
    console.log(`   • ${withEmbed}/${total} produits avec embeddings`);
    console.log(`   • ${categories.length}/7 catégories globales`);
    console.log(`   • RPC match_products_v2: ${rpcErr ? 'KO' : 'OK'}`);
    console.log(`   • Recherche vectorielle: ${rpcErr ? 'INDISPONIBLE' : 'OPÉRATIONNELLE'}`);
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

testVectorSearch();
