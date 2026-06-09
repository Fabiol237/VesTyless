#!/usr/bin/env node

/**
 * Script: Remplir les embeddings de tous les produits existants
 * 
 * Objectif:
 * - Récupérer tous les produits sans embeddings 1024D
 * - Analyser chaque image avec Pixtral
 * - Générer les embeddings avec Cohere
 * - Sauvegarder dans la base de données
 * - Optimiser pour la recherche visuelle
 * 
 * Utilisation:
 * npm run fill-embeddings
 */

import { CohereClient } from 'cohere-ai';
import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Mapping des 7 catégories
const CATEGORY_PROMPTS = {
  1: `Describe this clothing item. Focus on: exact type, PRIMARY COLOR, secondary colors, fabric, fit, neckline, sleeves, patterns, style. Max 60 words in English.`,
  2: `Analyze this footwear. Include: shoe type, colors, material, sole type, lace style, heel height. Max 60 words in English.`,
  3: `Describe this accessory. Type, color(s), material, size, design details. Max 60 words in English.`,
  4: `Analyze this outerwear. Type, color, lapel, buttons, pockets, length, sleeves. Max 60 words in English.`,
  5: `Describe these bottoms. Type, color, fit, material, length, waist style. Max 60 words in English.`,
  6: `Analyze this dress/skirt. Type, color, pattern, length, neckline, sleeves. Max 60 words in English.`,
  7: `Describe this sportswear. Type, color scheme, fabric, fit, design features. Max 60 words in English.`,
};

async function downloadImage(url, timeout = 10000) {
  try {
    const response = await fetch(url, { timeout });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.buffer();
  } catch (e) {
    console.warn(`  ⚠️  Image download failed: ${e.message}`);
    return null;
  }
}

async function analyzeImage(imageUrl, categoryId) {
  try {
    // Télécharger l'image
    const imageBuffer = await downloadImage(imageUrl);
    if (!imageBuffer) return null;

    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';

    // Analyser avec Pixtral
    const response = await mistral.chat.complete({
      model: 'pixtral-12b-2409',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              imageUrl: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: CATEGORY_PROMPTS[categoryId] || CATEGORY_PROMPTS[1],
            },
          ],
        },
      ],
      maxTokens: 100,
      temperature: 0.05,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (e) {
    console.warn(`  ⚠️  Analysis failed: ${e.message}`);
    return null;
  }
}

async function generateEmbedding(text) {
  try {
    const result = await cohere.embed({
      texts: [text],
      model: 'embed-english-v3.0',
      inputType: 'search_document',
    });

    const embedding = result.embeddings[0];
    if (!Array.isArray(embedding) || embedding.length !== 1024) {
      throw new Error(`Invalid embedding: ${embedding?.length}D`);
    }

    return embedding;
  } catch (e) {
    console.error(`  ❌ Embedding generation failed: ${e.message}`);
    return null;
  }
}

async function fillEmbeddings() {
  console.log('🚀 Remplissage des embeddings de produits...\n');

  try {
    // 1. Récupérer tous les produits
    console.log('📦 Récupération des produits...');
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, image_url, global_category_id, image_embedding_1024')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`✅ ${allProducts.length} produits trouvés\n`);

    // 2. Filtrer les produits sans embeddings
    const productsNeedingEmbeddings = allProducts.filter(
      p => !p.image_embedding_1024 && p.image_url
    );

    console.log(`📊 ${productsNeedingEmbeddings.length} produits ont besoin d'embeddings\n`);

    if (productsNeedingEmbeddings.length === 0) {
      console.log('✅ Tous les produits ont déjà des embeddings!');
      return;
    }

    // 3. Traiter chaque produit
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < productsNeedingEmbeddings.length; i++) {
      const product = productsNeedingEmbeddings[i];
      const progress = `[${i + 1}/${productsNeedingEmbeddings.length}]`;

      console.log(`${progress} ${product.name}`);

      try {
        // Analyser l'image
        console.log(`  📸 Analyse...`);
        const description = await analyzeImage(product.image_url, product.global_category_id);

        if (!description) {
          console.log(`  ❌ Analyse échouée`);
          failedCount++;
          continue;
        }

        console.log(`  ✅ ${description.substring(0, 50)}...`);

        // Générer embedding
        console.log(`  🧮 Embedding...`);
        const embedding = await generateEmbedding(description);

        if (!embedding) {
          failedCount++;
          continue;
        }

        // Sauvegarder
        console.log(`  💾 Sauvegarde...`);
        const { error: updateError } = await supabase
          .from('products')
          .update({
            image_embedding_1024: embedding,
            text_embedding_1024: embedding,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) throw updateError;

        successCount++;
        console.log(`  ✅ Succès!\n`);

        // Rate limiting: 1 produit par seconde
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.log(`  ❌ Erreur: ${e.message}\n`);
        failedCount++;
      }
    }

    // 4. Résumé
    console.log('\n📊 Résumé:');
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Échoués: ${failedCount}`);
    console.log(`   📈 Total: ${successCount + failedCount}\n`);

    console.log('🎉 Remplissage des embeddings terminé!');
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Lancer le script
fillEmbeddings().then(() => {
  console.log('\n✅ Script terminé avec succès');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erreur non gérée:', error);
  process.exit(1);
});
