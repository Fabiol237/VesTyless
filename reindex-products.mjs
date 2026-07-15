#!/usr/bin/env node

/**
 * Script : Re-indexation complète des produits VESTYLE
 *
 * Problème résolu :
 *   Les produits étaient indexés avec Cohere (payant, incompatible).
 *   Ce script re-génère TOUS les embeddings avec BAAI/bge-m3 via
 *   HF Inference API (GRATUIT, 1024D, multilingue).
 *
 * Ce que ça fait :
 *   1. Récupère tous les produits Supabase
 *   2. Pour chaque produit : génère embedding bge-m3 sur
 *      nom + description + catégorie
 *   3. Sauvegarde dans text_embedding_1024
 *
 * Utilisation :
 *   node reindex-products.mjs
 *
 * Durée estimée : ~1-2 secondes par produit (gratuit, pas de limite)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HF_TOKEN   = process.env.HUGGINGFACE_TOKEN;
const HF_BGE_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-m3';

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_TOKEN manquant dans .env.local');
  process.exit(1);
}

// ──────────────────────────────────────────────
// Génère embedding bge-m3 (1024D, GRATUIT)
// ──────────────────────────────────────────────
async function getBgeEmbedding(text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(HF_BGE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'x-wait-for-model': 'true',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      });

      if (res.status === 503) {
        // Modèle en cours de chargement → attendre et retry
        console.log(`    ⏳ Modèle bge-m3 en chargement... (tentative ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, 8000));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HF API ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();

      // bge-m3 retourne [f, f, f...] ou [[f,f,...]]
      let embedding = Array.isArray(data[0]) ? data[0] : data;

      if (!Array.isArray(embedding) || embedding.length < 100) {
        throw new Error(`Embedding invalide : ${embedding?.length ?? typeof embedding}D`);
      }

      // Tronquer à 1024D
      if (embedding.length > 1024) embedding = embedding.slice(0, 1024);

      // Normalisation L2
      const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
      if (norm > 0) embedding = embedding.map(v => v / norm);

      return embedding;

    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`    ⚠️  Tentative ${attempt} échouée: ${e.message} — retry...`);
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

// ──────────────────────────────────────────────
// Construit le texte d'indexation d'un produit
// Plus riche = meilleure recherche
// ──────────────────────────────────────────────
function buildProductText(product) {
  const parts = [];

  if (product.name)        parts.push(product.name);
  if (product.description) parts.push(product.description);
  if (product.price)       parts.push(`prix: ${product.price} FCFA`);

  // Enrichir avec la catégorie globale
  const CATEGORIES = {
    1: 'vêtements haut du corps chemise t-shirt',
    2: 'chaussures footwear sneakers boots',
    3: 'accessoires sac bijoux montre',
    4: 'manteau veste outerwear jacket',
    5: 'pantalon jean short bottom',
    6: 'robe jupe dress skirt',
    7: 'sportswear sport fitness',
  };
  if (product.global_category_id && CATEGORIES[product.global_category_id]) {
    parts.push(CATEGORIES[product.global_category_id]);
  }

  const text = parts.filter(Boolean).join(' | ');
  return text || 'produit de mode';
}

// ──────────────────────────────────────────────
// Re-indexation principale
// ──────────────────────────────────────────────
async function reindexProducts() {
  console.log('🚀 Démarrage de la re-indexation VESTYLE...\n');
  console.log('📡 Modèle : BAAI/bge-m3 (gratuit, 1024D, multilingue)');
  console.log('🗄️  Cible  : text_embedding_1024 dans Supabase\n');

  // 1. Récupérer tous les produits actifs
  console.log('📦 Chargement des produits depuis Supabase...');
  const { data: products, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, description, price, global_category_id')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (fetchErr) {
    console.error('❌ Erreur Supabase:', fetchErr.message);
    process.exit(1);
  }

  const total = products.length;
  console.log(`✅ ${total} produits trouvés\n`);
  console.log('─'.repeat(60));

  // 2. Traiter chaque produit
  let success = 0;
  let failed  = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const product  = products[i];
    const progress = `[${String(i + 1).padStart(3)}/${total}]`;
    const name     = (product.name || 'Produit sans nom').slice(0, 50);

    console.log(`\n${progress} ${name}`);

    // Construire le texte enrichi
    const productText = buildProductText(product);
    console.log(`    📝 Texte: "${productText.slice(0, 80)}..."`);

    try {
      // Générer embedding
      console.log('    🧮 Génération bge-m3...');
      const tStart    = Date.now();
      const embedding = await getBgeEmbedding(productText);
      const tEmbed    = Date.now() - tStart;

      console.log(`    ✅ Embedding ${embedding.length}D généré en ${tEmbed}ms`);

      // Sauvegarder dans Supabase
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          text_embedding_1024: embedding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (updateErr) throw new Error(`Supabase update: ${updateErr.message}`);

      console.log('    💾 Sauvegardé ✅');
      success++;

    } catch (e) {
      console.error(`    ❌ Erreur: ${e.message}`);
      failed++;
    }

    // Rate limiting doux : 800ms entre chaque produit
    // (HF Inference API gratuit = ~1000 req/jour, largement suffisant)
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // 3. Résumé final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSUMÉ DE RE-INDEXATION');
  console.log('═'.repeat(60));
  console.log(`   ✅ Succès  : ${success}/${total}`);
  console.log(`   ❌ Échoués : ${failed}/${total}`);
  if (skipped > 0) console.log(`   ⏭️  Ignorés : ${skipped}/${total}`);
  console.log('═'.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 Re-indexation COMPLÈTE ! La recherche textuelle est maintenant opérationnelle.');
    console.log('   → Test : node check-vector-search.mjs\n');
  } else {
    console.log(`\n⚠️  ${failed} produit(s) ont échoué. Relancez le script pour les réessayer.\n`);
  }
}

// Lancement
reindexProducts().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message);
  process.exit(1);
});
