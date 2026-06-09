#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

const productName = process.argv[2] || 'Produit de test automatique';
const categorySlug = process.argv[3] || null; // optionnel: alimentation, electronique, etc.

async function run() {
  try {
    // 1) Trouver une boutique existante
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
    
    if (storeError || !stores || stores.length === 0) {
      console.error('Aucune boutique trouvée. Créez d\'abord une boutique.');
      process.exit(1);
    }
    const storeId = stores[0].id;
    console.log('Boutique trouvée:', storeId);

    // 2) Trouver une catégorie globale
    let categoryQuery = supabase
      .from('global_categories')
      .select('id, name')
      .is('parent_id', null);
    
    if (categorySlug) {
      categoryQuery = categoryQuery.eq('slug', categorySlug);
    }
    
    const { data: cats, error: catError } = await categoryQuery.limit(1);
    
    if (catError || !cats || cats.length === 0) {
      console.error('Catégorie non trouvée.', categorySlug ? `(slug: ${categorySlug})` : '');
      process.exit(1);
    }
    const categoryId = cats[0].id;
    console.log('Catégorie trouvée:', cats[0].name, `(${categoryId})`);

    // 3) Insérer le produit
    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert([{
        store_id: storeId,
        global_category_id: categoryId,
        name: productName,
        description: 'Produit inséré pour test automatique',
        price: 9.99,
        stock_quantity: 10,
        is_active: true
      }])
      .select('id, name, global_category_id');
    
    if (insertError) {
      console.error('Erreur lors de l\'insertion :', insertError.message);
      process.exit(1);
    }
    
    if (inserted && inserted.length > 0) {
      console.log('✅ Produit inséré avec succès');
      console.log('   ID:', inserted[0].id);
      console.log('   Nom:', inserted[0].name);
      console.log('   Catégorie ID:', categoryId);
    }
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

run();
