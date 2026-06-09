#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkVectorSearch() {
  try {
    console.log('🔍 DIAGNOSTIC RECHERCHE VECTORIELLE...\n');
    
    // 1) Vérifier les produits et leurs embeddings
    console.log('1️⃣ ÉTAT DES EMBEDDINGS:');
    const { data: products, error: err1 } = await supabase
      .from('products')
      .select('id, name, text_embedding_1024, image_embedding_1024');
    
    if (err1) throw err1;
    
    console.log(`Total produits: ${products.length}\n`);
    
    products.slice(0, 5).forEach((p, i) => {
      const hasTextEmbed = p.text_embedding_1024 ? '✅' : '❌';
      const hasImgEmbed = p.image_embedding_1024 ? '✅' : '❌';
      console.log(`${i+1}. ${p.name}`);
      console.log(`   text_embedding_1024: ${hasTextEmbed}`);
      console.log(`   image_embedding_1024: ${hasImgEmbed}`);
    });
    
    const productsWithEmbed = products.filter(p => p.text_embedding_1024 || p.image_embedding_1024).length;
    const productsWithoutEmbed = products.length - productsWithEmbed;
    console.log(`\nRésumé: ${productsWithEmbed} avec embeddings, ${productsWithoutEmbed} sans`);
    
    // 2) Tester le RPC match_products_v2
    console.log('\n2️⃣ TEST DU RPC match_products_v2:');
    
    // Créer un dummy embedding 1024D
    const dummyEmbedding = Array(1024).fill(0.1);
    
    try {
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('match_products_v2', {
        query_embedding: dummyEmbedding,
        match_threshold: 0.0,
        match_count: 5
      });
      
      if (rpcErr) {
        console.log(`❌ RPC ERROR: ${rpcErr.message}`);
        console.log(`   Code: ${rpcErr.code}`);
      } else {
        console.log(`✅ RPC SUCCESS - Résultats: ${rpcResult?.length || 0} produits`);
        if (rpcResult && rpcResult.length > 0) {
          rpcResult.slice(0, 3).forEach((r, i) => {
            console.log(`   ${i+1}. ${r.name} (similarité: ${r.similarity?.toFixed(3)})`);
          });
        }
      }
    } catch (e) {
      console.log(`❌ EXCEPTION RPC: ${e.message}`);
    }
    
    // 3) Vérifier les colonnes de la table products
    console.log('\n3️⃣ SCHÉMA TABLE products:');
    const { data: schema, error: schemaErr } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'products');
    
    if (!schemaErr && schema) {
      schema.forEach(col => {
        if (col.column_name.includes('embed') || col.column_name.includes('vector')) {
          console.log(`   ${col.column_name}: ${col.data_type}`);
        }
      });
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

checkVectorSearch();
