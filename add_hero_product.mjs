/**
 * Script simplifié: ajouter le produit hero-bg.png
 * en appelant l'API locale pour l'embedding
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qkqowrwkmipxyktjdvfg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwNzY1NzAsImV4cCI6MTk2MjY1MjU3MH0.jPnE-Fw4TdiBaEkSYx7CPJCdBlyP83e_3vCeW0K1tZE'
);

async function addHeroProduct() {
  try {
    console.log('🚀 Ajout du produit hero-bg.png avec embedding...\n');

    // Chercher un store
    const { data: stores } = await supabase.from('stores').select('id').limit(1);
    if (!stores || stores.length === 0) {
      throw new Error('Aucun store trouvé!');
    }
    const storeId = stores[0].id;
    console.log('✅ Store trouvé:', storeId);

    // Appeler l'API locale pour générer l'embedding
    console.log('\n[1/2] Génération embedding via API locale...');
    const embedRes = await fetch('http://localhost:3000/api/products/generate-embeddings-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: 'https://localhost:3000/hero-bg.png', // URL locale
        categoryId: 1, // Vêtements (sera forcé à Mode & Beauté si nécessaire)
        name: 'Chemise Fashion Bleue - Test Recherche',
        description: 'Produit test pour la recherche visuelle'
      })
    });

    if (!embedRes.ok) {
      const text = await embedRes.text();
      throw new Error(`API Error ${embedRes.status}: ${text}`);
    }

    const embedData = await embedRes.json();
    if (!embedData.success || !embedData.embedding) {
      throw new Error(embedData.error || 'Invalid embedding response');
    }

    console.log('   ✅ Embedding généré:', embedData.embedding.length, 'D');
    console.log('   Description:', embedData.visionAnalysis);

    // Créer le produit
    console.log('\n[2/2] Création du produit en base...');
    
    // Chercher la catégorie Mode & Beauté
    const { data: categories } = await supabase
      .from('global_categories')
      .select('id')
      .eq('name', 'Mode & Beauté')
      .single();

    const categoryId = categories?.id || 'c1000000-0000-0000-0000-000000000001';

    const newProduct = {
      store_id: storeId,
      global_category_id: categoryId,
      name: 'Chemise Fashion Bleue - Test Recherche',
      description: embedData.visionAnalysis,
      price: 45000,
      stock_quantity: 1,
      image_url: 'https://localhost:3000/hero-bg.png',
      image_embedding_1024: embedData.embedding,
      text_embedding_1024: embedData.embedding,
      is_active: true,
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('   ✅ Produit créé:', product.id);
    console.log('\n✨ Succès! Produit prêt pour test de recherche visuelle');
    console.log('   ID:', product.id);
    console.log('   Nom:', product.name);
    console.log('   Embedding size:', embedData.embedding.length);
    
  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
    process.exit(1);
  }
}

addHeroProduct();
