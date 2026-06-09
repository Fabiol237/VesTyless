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

// 7 catégories d'accueil
const categories = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Mode & Beauté', slug: 'mode-beaute', icon: 'Shirt' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Alimentation & Supermarché', slug: 'alimentation', icon: 'ShoppingCart' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Électronique & High-Tech', slug: 'electronique', icon: 'Smartphone' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Maison & Électroménager', slug: 'maison', icon: 'Home' },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Santé & Bien-être', slug: 'sante', icon: 'Heart' },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'Services & Loisirs', slug: 'services-loisirs', icon: 'Star' },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Divers', slug: 'divers', icon: 'Package' }
];

async function run() {
  try {
    console.log('Détachement des produits des catégories (global_category_id -> NULL)...');
    // Mettre global_category_id à NULL pour tous les produits
    const { error: updateError } = await supabase
      .from('products')
      .update({ global_category_id: null })
      .gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (updateError) {
      console.warn('Attention lors de la mise à jour des produits:', updateError.message);
    } else {
      console.log('Produits détachés des catégories.');
    }
    
    console.log('Suppression des catégories existantes...');
    // Supprimer toutes les catégories
    const { error: deleteError } = await supabase
      .from('global_categories')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.warn('Attention lors de la suppression:', deleteError.message);
    } else {
      console.log('Catégories supprimées.');
    }
    
    console.log('Insertion des 7 catégories globales...');
    const { data: inserted, error } = await supabase
      .from('global_categories')
      .insert(categories)
      .select('id, name');
    
    if (error) {
      console.error('Erreur lors de l\'insertion :', error.message);
      process.exit(1);
    }
    
    console.log('✅ Seed des catégories exécuté avec succès.');
    console.log('Catégories créées:');
    inserted?.forEach(cat => console.log(`  - ${cat.name}`));
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

run();
