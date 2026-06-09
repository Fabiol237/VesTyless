#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Récupérer toutes les catégories
const { data: categories, error } = await supabase
  .from('global_categories')
  .select('id, name, slug, icon')
  .is('parent_id', null)
  .order('name');

if (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

console.log(`✅ ${categories?.length || 0} catégories trouvées:\n`);
categories?.forEach((cat, i) => {
  console.log(`${i + 1}. ${cat.name}`);
  console.log(`   Slug: ${cat.slug}`);
  console.log(`   Icon: ${cat.icon}`);
  console.log();
});

// Vérifier les produits par catégorie
const { data: productsByCategory, error: prodError } = await supabase
  .from('products')
  .select('id, name, global_category_id, global_categories(name)')
  .not('global_category_id', 'is', null);

if (!prodError && productsByCategory) {
  console.log(`\n📦 Produits par catégorie:`);
  const grouped = {};
  productsByCategory.forEach(p => {
    const catName = p.global_categories?.name || 'Sans catégorie';
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(p.name);
  });
  
  Object.entries(grouped).forEach(([cat, products]) => {
    console.log(`\n${cat}: ${products.length} produit(s)`);
    products.forEach(p => console.log(`  - ${p}`));
  });
}
