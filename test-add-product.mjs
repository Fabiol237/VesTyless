#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAddProduct() {
  try {
    console.log('🧪 TEST D\'AJOUT DE PRODUIT\n');
    
    // Chercher une boutique
    const { data: stores, error: storeErr } = await supabase
      .from('stores')
      .select('id, name')
      .limit(1);
    
    if (storeErr || !stores?.length) {
      console.error('❌ Aucune boutique trouvée');
      process.exit(1);
    }
    
    const store = stores[0];
    console.log(`✅ Boutique: ${store.name}\n`);
    
    // Chercher une catégorie
    const { data: categories, error: catErr } = await supabase
      .from('global_categories')
      .select('id, name')
      .limit(1);
    
    if (catErr || !categories?.length) {
      console.error('❌ Aucune catégorie trouvée');
      process.exit(1);
    }
    
    const category = categories[0];
    console.log(`✅ Catégorie: ${category.name}\n`);
    
    // Créer un embedding simple
    const embedding = Array(1024).fill(0.1);
    
    // Ajouter un produit
    console.log('⏳ Création du produit...');
    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert([{
        store_id: store.id,
        global_category_id: category.id,
        name: 'Produit Test Dashboard',
        description: 'Produit créé pour tester le dashboard corrigé',
        price: 12999,
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        text_embedding_1024: embedding,
        image_embedding_1024: embedding,
        is_active: true
      }])
      .select('id, name, global_category_id')
      .single();
    
    if (insertErr) {
      console.error('❌ Erreur:', insertErr.message);
      process.exit(1);
    }
    
    console.log(`✅ Produit créé!`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Nom: ${product.name}`);
    console.log(`   Catégorie ID: ${product.global_category_id}\n`);
    
    console.log('✅ TEST RÉUSSI - Aller au dashboard pour vérifier');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

testAddProduct();
