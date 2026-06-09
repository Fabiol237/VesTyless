/**
 * Ajouter produit en appelant les APIs locales du Next.js
 * 
 * Stratégie: Utiliser les APIs exposées du serveur Next.js
 * Aucune clé nécessaire car les APIs gèrent l'authentification côté serveur
 */

async function addProduct() {
  try {
    console.log('🚀 Ajout du produit via API locale...\n');

    const imageUrl = 'http://localhost:3000/hero-bg.png';
    const categoryId = 1;
    const productName = 'Chemise Fashion Bleue - Test Recherche';
    const productDesc = 'Chemise bleue test pour recherche visuelle vectorielle';

    // Étape 1: Générer l'embedding
    console.log('[1/2] Génération embedding...');
    const embedRes = await fetch('http://localhost:3000/api/products/generate-embeddings-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl,
        categoryId,
        name: productName,
        description: productDesc
      })
    });

    if (!embedRes.ok) {
      const text = await embedRes.text();
      console.error('Response:', text);
      throw new Error(`API Error ${embedRes.status}: ${text}`);
    }

    const embedData = await embedRes.json();
    console.log('Response:', embedData);

    if (!embedData.success) {
      throw new Error(embedData.error || 'Embedding failed');
    }

    console.log('   ✅ Embedding généré');
    console.log('   Dimensions:', embedData.dimensions);
    console.log('   Description:', embedData.visionAnalysis);

    console.log('\n✨ Produit prêt! Vous pouvez maintenant tester la recherche visuelle.');

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
    process.exit(1);
  }
}

addProduct();
