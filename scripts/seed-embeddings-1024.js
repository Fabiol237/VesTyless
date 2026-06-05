#!/usr/bin/env node
/**
 * Script : Remplir les colonnes 1024D avec des embeddings dummy (pour test)
 * Usage: node scripts/seed-embeddings-1024.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Créer un embedding dummy 1024D (pour test, avant d'avoir Cohere fonctionnel)
function createDummyEmbedding() {
  return Array(1024).fill(0).map(() => Math.random() * 0.1 - 0.05);
}

async function seedEmbeddings1024() {
  try {
    console.log('📦 Seed: Récupération des produits...');
    
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .limit(100);
    
    if (fetchError) throw fetchError;
    
    console.log(`✅ Trouvé ${products.length} produits`);
    
    let updated = 0;
    for (const product of products) {
      const textEmb = createDummyEmbedding();
      const imgEmb = createDummyEmbedding();
      
      const { error: updateError } = await supabase
        .from('products')
        .update({
          text_embedding_1024: textEmb,
          image_embedding_1024: imgEmb
        })
        .eq('id', product.id);
      
      if (!updateError) {
        updated++;
        if (updated % 10 === 0) console.log(`  ${updated}/${products.length}`);
      }
    }
    
    console.log(`\n✅ Seed complété: ${updated}/${products.length} produits updatés`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedEmbeddings1024();
