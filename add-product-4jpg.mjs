#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

async function uploadImage(imagePath) {
  try {
    console.log('📤 Upload de l\'image 4.jpg vers Cloudinary...');
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', 'vestyle_unsigned');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    console.log('✅ Image uploadée');
    return data.secure_url;
  } catch (err) {
    console.log('⚠️  Upload impossible:', err.message);
    return 'https://images.unsplash.com/photo-1553926069-e91a4cb6b371?w=400&h=400&fit=crop';
  }
}

async function addProductWithImage() {
  try {
    console.log('🖼️  AJOUT D\'UN PRODUIT AVEC L\'IMAGE 4.JPG\n');
    
    const imagePath = 'C:\\Users\\WINDOWS 10\\Desktop\\4.jpg';
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Fichier 4.jpg non trouvé');
      process.exit(1);
    }
    
    console.log(`✅ Image trouvée: ${imagePath}`);
    
    // Upload l'image
    const imageUrl = await uploadImage(imagePath);
    console.log(`✅ URL image: ${imageUrl}\n`);
    
    // Trouver une boutique
    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
    
    if (!stores || stores.length === 0) {
      console.error('❌ Aucune boutique trouvée');
      process.exit(1);
    }
    
    const storeId = stores[0].id;
    
    // Trouver une catégorie aléatoire
    const { data: categories } = await supabase
      .from('global_categories')
      .select('id, name')
      .order('id');
    
    if (!categories || categories.length === 0) {
      console.error('❌ Aucune catégorie trouvée');
      process.exit(1);
    }
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    console.log(`✅ Catégorie: ${randomCategory.name}\n`);
    
    // Générer embedding
    console.log('⏳ Génération de l\'embedding...');
    
    const embedRes = await cohere.embed({
      texts: ['Produit testé avec image 4.jpg pour recherche vectorielle. Test complet de la plateforme.'],
      model: 'embed-english-v3.0',
      inputType: 'search_document',
      embeddingTypes: ['float']
    });
    
    const embedding = embedRes.embeddings.float[0];
    console.log(`✅ Embedding généré (${embedding.length}D)\n`);
    
    // Créer le produit
    console.log('⏳ Création du produit...');
    
    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert([{
        store_id: storeId,
        global_category_id: randomCategory.id,
        name: 'Produit Test 4.jpg',
        description: 'Produit créé pour tester la recherche vectorielle avec l\'image 4.jpg',
        price: 5999,
        stock_quantity: 50,
        image_url: imageUrl,
        text_embedding_1024: embedding,
        image_embedding_1024: embedding,
        is_active: true
      }])
      .select('id, name')
      .single();
    
    if (insertErr) {
      console.error('❌ Erreur création produit:', insertErr.message);
      process.exit(1);
    }
    
    console.log(`✅ Produit créé: ${product.name}\n`);
    
    console.log('✅ PRÊT POUR TESTER LA RECHERCHE À L\'ACCUEIL');
    console.log(`   Allez à http://localhost:3000`);
    console.log(`   Cherchez: "4.jpg" ou "test"`);
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

addProductWithImage();
