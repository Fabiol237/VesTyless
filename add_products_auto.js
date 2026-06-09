const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Produits à ajouter - MODIFIE SELON TES BESOINS
const productsToAdd = [
  {
    name: 'Chemise Blanche Premium',
    description: 'Chemise blanche en coton 100%, coupe slim, idéale pour les occasions formelles et décontractées',
    price: 25000,
    category: 'Mode & Beauté',
    store_name: 'ZOFAROCLUB',
    image_url: 'https://images.unsplash.com/photo-1596215578519-c21a5a3acf38?w=500'
  },
  {
    name: 'Pantalon Noir Classique',
    description: 'Pantalon noir en laine, coupe droite, poche avant et arrière, ceinture incluse',
    price: 35000,
    category: 'Mode & Beauté',
    store_name: 'ZOFAROCLUB',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500'
  },
  {
    name: 'Robe de Soirée Élégante',
    description: 'Robe de soirée en soie, couleur rouge bordeaux, manches longues, fermeture éclair discrète',
    price: 50000,
    category: 'Mode & Beauté',
    store_name: 'zokostore',
    image_url: 'https://images.unsplash.com/photo-1595777707802-221b2b4b1efc?w=500'
  },
  {
    name: 'T-Shirt Oversize Coton',
    description: 'T-shirt oversize gris en coton bio, confortable pour tous les jours, logo minimaliste',
    price: 15000,
    category: 'Mode & Beauté',
    store_name: 'zokostore',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
  }
];

async function addProductsWithEmbeddings() {
  console.log('🚀 AJOUT AUTOMATIQUE DE PRODUITS\n');

  // 1. Récupérer les boutiques
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('is_active', true);

  if (!stores || stores.length === 0) {
    console.log('❌ Aucune boutique trouvée');
    return;
  }

  console.log(`✅ ${stores.length} boutiques trouvées\n`);

  // 2. Récupérer les catégories
  const { data: categories } = await supabase
    .from('global_categories')
    .select('id, name');

  if (!categories || categories.length === 0) {
    console.log('❌ Aucune catégorie trouvée');
    return;
  }

  console.log(`✅ ${categories.length} catégories trouvées\n`);

  // 3. Ajouter chaque produit
  let successCount = 0;
  let errorCount = 0;

  for (const product of productsToAdd) {
    console.log(`\n📝 Ajout: "${product.name}"...`);

    try {
      // Trouver la boutique
      const store = stores.find(s => s.name.toLowerCase() === product.store_name.toLowerCase());
      if (!store) {
        console.log(`   ❌ Boutique "${product.store_name}" non trouvée`);
        errorCount++;
        continue;
      }

      // Trouver la catégorie
      const category = categories.find(c => c.name === product.category);
      const categoryId = category?.id || null;

      // Générer les embeddings Cohere
      console.log(`   ⏳ Génération embeddings Cohere...`);
      
      const fullText = [product.name, product.description].filter(Boolean).join(' | ');
      
      const embedResult = await cohere.embed({
        texts: [fullText],
        model: 'embed-english-v3.0',
        inputType: 'search_document',
      });

      const embedding = embedResult.embeddings[0];
      console.log(`   ✅ Embedding généré (${embedding.length}D)`);

      // Créer le produit
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          store_id: store.id,
          name: product.name,
          description: product.description,
          price: product.price,
          global_category_id: categoryId,
          image_url: product.image_url,
          images: [product.image_url],
          text_embedding_1024: embedding,
          image_embedding_1024: embedding,
          stock_quantity: 10
        }])
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Produit créé (ID: ${newProduct.id})`);
        console.log(`      Boutique: ${store.name}`);
        console.log(`      Prix: ${product.price} FCFA`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
      errorCount++;
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Produits ajoutés: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📦 Total: ${successCount + errorCount}/${productsToAdd.length}`);

  // Vérifier les produits en base
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, price, store_id')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n📋 DERNIERS PRODUITS EN BASE:');
  allProducts?.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.price} FCFA)`);
  });

  console.log('\n✨ FAIT!');
}

addProductsWithEmbeddings().catch(console.error);
