#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Les 7 catégories officielles
const officialCategories = [
  'c1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000004',
  'c1000000-0000-0000-0000-000000000005',
  'c1000000-0000-0000-0000-000000000006',
  'c1000000-0000-0000-0000-000000000007'
];

async function cleanDatabase() {
  try {
    console.log('📊 DIAGNOSTIC DES CATÉGORIES...\n');
    
    // 1) Récupérer toutes les catégories
    const { data: allCats, error: err1 } = await supabase
      .from('global_categories')
      .select('*');
    
    if (err1) throw err1;
    
    console.log(`Total catégories: ${allCats.length}`);
    
    // 2) Identifier les fausses catégories
    const fakeCategories = allCats.filter(c => !officialCategories.includes(c.id));
    const parentIdNotNull = allCats.filter(c => c.parent_id !== null && c.parent_id !== undefined);
    
    console.log(`Catégories non-officielles: ${fakeCategories.length}`);
    console.log(`Catégories avec parent_id non-NULL: ${parentIdNotNull.length}\n`);
    
    if (fakeCategories.length > 0) {
      console.log('Catégories à supprimer:');
      fakeCategories.forEach(c => {
        console.log(`  ❌ ${c.id} - ${c.name} (parent_id: ${c.parent_id})`);
      });
      console.log();
    }
    
    // 3) Détacher les produits liés aux fausses catégories
    if (fakeCategories.length > 0) {
      console.log('Détachement des produits des fausses catégories...');
      const fakeIds = fakeCategories.map(c => c.id);
      
      const { error: updateErr } = await supabase
        .from('products')
        .update({ global_category_id: null })
        .in('global_category_id', fakeIds);
      
      if (updateErr) throw updateErr;
      console.log('✅ Produits détachés\n');
    }
    
    // 4) Supprimer les fausses catégories
    if (fakeCategories.length > 0) {
      console.log('Suppression des fausses catégories...');
      const fakeIds = fakeCategories.map(c => c.id);
      
      const { error: delErr } = await supabase
        .from('global_categories')
        .delete()
        .in('id', fakeIds);
      
      if (delErr) throw delErr;
      console.log(`✅ ${fakeCategories.length} catégories supprimées\n`);
    }
    
    // 5) Supprimer les catégories avec parent_id non-NULL (sous-catégories)
    if (parentIdNotNull.length > 0) {
      console.log('Suppression des sous-catégories (parent_id non-NULL)...');
      const subIds = parentIdNotNull.map(c => c.id);
      
      // Détacher les produits d'abord
      const { error: updateErr } = await supabase
        .from('products')
        .update({ global_category_id: null })
        .in('global_category_id', subIds);
      
      if (updateErr && updateErr.code !== 'PGRST116') throw updateErr;
      
      const { error: delErr } = await supabase
        .from('global_categories')
        .delete()
        .not('id', 'in', `(${officialCategories.map(id => `'${id}'`).join(',')})`);
      
      if (delErr && delErr.code !== 'PGRST116') throw delErr;
      console.log(`✅ Sous-catégories supprimées\n`);
    }
    
    // 6) Vérifier l'état final
    console.log('État final des catégories:');
    const { data: finalCats } = await supabase
      .from('global_categories')
      .select('*')
      .order('name');
    
    console.log(`Total: ${finalCats.length} catégories\n`);
    finalCats.forEach((c, i) => {
      console.log(`${i+1}. ${c.name}`);
      console.log(`   ID: ${c.id}`);
      console.log(`   parent_id: ${c.parent_id || 'NULL'}`);
    });
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

cleanDatabase();
