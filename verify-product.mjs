#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vérifier le produit inséré
const { data: products, error } = await supabase
  .from('products')
  .select('id, name, global_category_id, global_categories(name)')
  .eq('name', 'T-shirt Premium');

if (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

if (products && products.length > 0) {
  console.log('✅ Produit trouvé:');
  products.forEach(p => {
    console.log(`  - Nom: ${p.name}`);
    console.log(`  - ID: ${p.id}`);
    console.log(`  - Catégorie: ${p.global_categories?.name || 'AUCUNE'}`);
    console.log(`  - global_category_id: ${p.global_category_id}`);
  });
} else {
  console.log('❌ Aucun produit "T-shirt Premium" trouvé.');
}
