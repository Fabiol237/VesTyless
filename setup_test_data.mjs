/**
 * Créer un store de test et ajouter le produit hero-bg.png
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qkqowrwkmipxyktjdvfg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwNzY1NzAsImV4cCI6MTk2MjY1MjU3MH0.jPnE-Fw4TdiBaEkSYx7CPJCdBlyP83e_3vCeW0K1tZE'
);

async function setupTestData() {
  try {
    console.log('🚀 Configuration données de test...\n');

    // Créer un store de test
    console.log('[1/3] Création d\'un store de test...');
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([
        {
          name: 'VesTyle Test Shop',
          owner_id: 'test-user-' + Date.now(),
          description: 'Store pour test de recherche visuelle',
          region: 'Test Region',
          is_active: true,
        }
      ])
      .select()
      .single();

    if (storeError) {
      console.error('   Erreur création store:', storeError.message);
      // Essayer de récupérer un store existant
      const { data: existingStores } = await supabase.from('stores').select('id').limit(1);
      if (!existingStores || existingStores.length === 0) {
        throw new Error('Cannot create or find store');
      }
      console.log('   ✅ Store existant trouvé');
    } else {
      console.log('   ✅ Store créé:', store.id);
    }

    const storeId = store?.id || (await supabase.from('stores').select('id').limit(1)).data[0].id;

    // Appeler l'API locale pour générer l'embedding
    console.log('\n[2/3] Génération embedding via API locale...');
    const embedRes = await fetch('http://localhost:3000/api/products/generate-embeddings-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: 'http://localhost:3000/hero-bg.png',
        categoryId: 1,
        name: 'Chemise Fashion Bleue - Test',
        description: 'Produit test recherche'
      })
    });

    if (!embedRes.ok) {
      throw new Error(`API Error ${embedRes.status}`);
    }

    const embedData = await embedRes.json();
    if (!embedData.success || !embedData.embedding) {
      throw new Error('Invalid embedding response');
    }

    console.log('   ✅ Embedding généré:', embedData.embedding.length, 'D');

    // Créer le produit
    console.log('\n[3/3] Création du produit en base...');
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          store_id: storeId,
          global_category_id: 'c1000000-0000-0000-0000-000000000001',
          name: 'Chemise Fashion Bleue - Test',
          description: embedData.visionAnalysis,
          price: 45000,
          stock_quantity: 1,
          image_url: 'http://localhost:3000/hero-bg.png',
          image_embedding_1024: embedData.embedding,
          text_embedding_1024: embedData.embedding,
          is_active: true,
        }
      ])
      .select()
      .single();

    if (productError) {
      throw new Error(`Product error: ${productError.message}`);
    }

    console.log('   ✅ Produit créé:', product.id);
    console.log('\n✨ Succès! Données de test prêtes');

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
    process.exit(1);
  }
}

setupTestData();
