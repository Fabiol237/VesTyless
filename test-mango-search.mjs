#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

async function addMangoProduct() {
  try {
    console.log('🥭 AJOUT D\'UN PRODUIT MANGUE...\n');
    
    // URL d'une image de mangue publique (Unsplash)
    const mangoImageUrl = 'https://images.unsplash.com/photo-1553926069-e91a4cb6b371?w=400&h=400&fit=crop';
    
    // 1) Trouver une boutique
    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
    
    if (!stores || stores.length === 0) {
      console.error('❌ Aucune boutique trouvée');
      process.exit(1);
    }
    
    const storeId = stores[0].id;
    console.log(`✅ Boutique trouvée: ${storeId}`);
    
    // 2) Trouver la catégorie "Alimentation & Supermarché"
    const { data: categories } = await supabase
      .from('global_categories')
      .select('id, name')
      .eq('slug', 'alimentation');
    
    if (!categories || categories.length === 0) {
      console.error('❌ Catégorie Alimentation non trouvée');
      process.exit(1);
    }
    
    const categoryId = categories[0].id;
    console.log(`✅ Catégorie trouvée: ${categories[0].name}\n`);
    
    // 3) Générer l'embedding pour "mangue"
    console.log('⏳ Génération de l\'embedding via Cohere...');
    
    const embedRes = await cohere.embed({
      texts: ['Mangue fraîche, fruit tropical délicieux, sucrée et juteuse. Parfait pour les jus et desserts.'],
      model: 'embed-english-v3.0',
      inputType: 'search_document',
      embeddingTypes: ['float']
    });
    
    if (!embedRes.embeddings || !embedRes.embeddings.float || embedRes.embeddings.float.length === 0) {
      throw new Error('Pas d\'embeddings retournés par Cohere');
    }
    
    const embedding = embedRes.embeddings.float[0];
    console.log(`✅ Embedding généré (${embedding.length}D)\n`);
    
    // 4) Créer le produit
    console.log('⏳ Création du produit...');
    
    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert([{
        store_id: storeId,
        global_category_id: categoryId,
        name: 'Mangue Fraîche Premium',
        description: 'Fruit tropical délicieux, sucrée et juteuse. Parfait pour les jus, smoothies et desserts.',
        price: 2500,
        stock_quantity: 25,
        image_url: mangoImageUrl,
        text_embedding_1024: embedding,
        image_embedding_1024: embedding,
        is_active: true
      }])
      .select('id, name, global_categories(name)')
      .single();
    
    if (insertErr) {
      console.error('❌ Erreur création produit:', insertErr.message);
      process.exit(1);
    }
    
    console.log(`✅ Produit créé:`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Nom: ${product.name}`);
    console.log(`   Catégorie: ${product.global_categories.name}\n`);
    
    // 5) Tester la recherche vectorielle
    console.log('🔍 TEST DE RECHERCHE VECTORIELLE...\n');
    
    // Générer un embedding pour une requête de recherche
    const queryEmbedRes = await cohere.embed({
      texts: ['mangue tropical fruit sucré'],
      model: 'embed-english-v3.0',
      inputType: 'search_query',
      embeddingTypes: ['float']
    });
    
    const queryEmbedding = queryEmbedRes.embeddings.float[0];
    
    // Exécuter la recherche RPC
    const { data: results, error: rpcErr } = await supabase.rpc('match_products_v2', {
      query_embedding: queryEmbedding,
      match_threshold: 0.0,
      match_count: 5
    });
    
    if (rpcErr) {
      console.log(`❌ Erreur RPC: ${rpcErr.message}`);
      process.exit(1);
    }
    
    console.log(`✅ Résultats de la recherche (5 meilleurs):\n`);
    
    if (results && results.length > 0) {
      const mangoProduct = results.find(r => r.name.toLowerCase().includes('mangue'));
      
      results.slice(0, 5).forEach((r, i) => {
        const icon = r.name.toLowerCase().includes('mangue') ? '🥭' : '  ';
        const similarityPercent = (r.similarity * 100).toFixed(1);
        console.log(`${i + 1}. ${icon} ${r.name}`);
        console.log(`   Similarité: ${similarityPercent}%\n`);
      });
      
      if (mangoProduct) {
        console.log('✅ LA MANGUE EST TROUVABLE PAR RECHERCHE VECTORIELLE !');
        console.log(`   Rang: ${results.indexOf(mangoProduct) + 1}/5`);
        console.log(`   Similarité: ${(mangoProduct.similarity * 100).toFixed(1)}%`);
      } else {
        console.log('⚠️  La mangue n\'est pas dans les 5 premiers résultats');
      }
    } else {
      console.log('⚠️  Aucun résultat trouvé');
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

addMangoProduct();
