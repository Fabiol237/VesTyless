#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping des catégories basé sur les mots-clés
const categoryKeywords = {
  'c1000000-0000-0000-0000-000000000001': ['chemise', 't-shirt', 'pantalon', 'robe', 'mode', 'vêtement', 'beauté', 'cosmétique', 'crème'],
  'c1000000-0000-0000-0000-000000000002': ['fruit', 'légume', 'aliment', 'nourriture', 'épicerie', 'supermarché', 'alimentaire', 'produit alimentaire'],
  'c1000000-0000-0000-0000-000000000003': ['laptop', 'ordinateur', 'téléphone', 'smartphone', 'électronique', 'technologie', 'gadget', 'appareil'],
  'c1000000-0000-0000-0000-000000000004': ['aspirateur', 'meubles', 'maison', 'électroménager', 'ustensile', 'cuisine', 'table', 'chaise'],
  'c1000000-0000-0000-0000-000000000005': ['santé', 'bien-être', 'vitamines', 'supplement', 'médical', 'pharmacie'],
  'c1000000-0000-0000-0000-000000000006': ['service', 'loisir', 'divertissement', 'jeu', 'sport'],
  'c1000000-0000-0000-0000-000000000007': ['autre', 'divers', 'test', 'couteau'] // Catégorie par défaut
};

async function assignCategoriesAutomatically() {
  try {
    console.log('🔄 ASSIGNATION AUTOMATIQUE DES CATÉGORIES\n');
    
    // Récupérer les produits sans catégorie
    const { data: productsWithoutCategory } = await supabase
      .from('products')
      .select('id, name, description')
      .is('global_category_id', null);
    
    if (!productsWithoutCategory || productsWithoutCategory.length === 0) {
      console.log('✅ Tous les produits ont une catégorie !');
      return;
    }
    
    console.log(`📊 ${productsWithoutCategory.length} produits sans catégorie\n`);
    
    let assignedCount = 0;
    
    for (const product of productsWithoutCategory) {
      const searchText = `${product.name} ${product.description || ''}`.toLowerCase();
      
      // Trouver la catégorie appropriée
      let assignedCategoryId = null;
      let matchedKeywords = [];
      
      for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (searchText.includes(keyword)) {
            assignedCategoryId = categoryId;
            matchedKeywords.push(keyword);
            break;
          }
        }
        if (assignedCategoryId) break;
      }
      
      // Si aucune catégorie trouvée, assigner à "Divers"
      if (!assignedCategoryId) {
        assignedCategoryId = 'c1000000-0000-0000-0000-000000000007';
        matchedKeywords = ['(défaut)'];
      }
      
      // Mettre à jour le produit
      const { error: updateErr } = await supabase
        .from('products')
        .update({ global_category_id: assignedCategoryId })
        .eq('id', product.id);
      
      if (!updateErr) {
        console.log(`✅ ${product.name.substring(0, 30).padEnd(30)} → ${matchedKeywords.join(', ') || 'Divers'}`);
        assignedCount++;
      } else {
        console.log(`❌ ${product.name.substring(0, 30).padEnd(30)} → ERROR: ${updateErr.message}`);
      }
    }
    
    console.log(`\n✅ Assignation complétée: ${assignedCount}/${productsWithoutCategory.length} produits`);
    
    // Afficher le résumé final
    console.log('\n📊 ÉTAT FINAL:');
    const { data: finalProducts } = await supabase
      .from('products')
      .select('global_category_id, global_categories(name)');
    
    const grouped = {};
    finalProducts.forEach(p => {
      const catName = p.global_categories?.name || 'SANS CATÉGORIE';
      if (!grouped[catName]) grouped[catName] = 0;
      grouped[catName]++;
    });
    
    Object.entries(grouped).forEach(([cat, count]) => {
      const icon = cat === 'SANS CATÉGORIE' ? '⚠️' : '✅';
      console.log(`   ${icon} ${cat}: ${count} produits`);
    });
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

assignCategoriesAutomatically();
