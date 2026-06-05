#!/usr/bin/env node
/**
 * Test Script for VesTyle APIs
 * Tests: Chat, Visual Search, Semantic Search, Generate Embeddings
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function test1_ChatAPI() {
  console.log('\n1️⃣  TEST: /api/chat');
  console.log('━'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Dis bonjour très brièvement' }
        ],
        tts: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status:', response.status);
      console.log('✅ Réponse IA:', data.content?.substring(0, 100) || 'N/A');
      console.log('✅ TTS audio inclus:', !!data.audioBase64);
      return true;
    } else {
      console.log('❌ Status:', response.status);
      const text = await response.text();
      console.log('❌ Erreur:', text.substring(0, 200));
      return false;
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
    return false;
  }
}

async function test2_GenerateEmbeddings() {
  console.log('\n2️⃣  TEST: /api/products/generate-embeddings');
  console.log('━'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/products/generate-embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Robe fleurie rose',
        description: 'Robe longue avec motifs floraux colorés, tissu fluide, parfait pour l\'été'
      })
    });

    if (response.ok) {
      const data = await response.json();
      const dims = data.embedding?.length || 0;
      console.log('✅ Status:', response.status);
      console.log('✅ Embedding dimensions:', dims);
      if (dims === 768) {
        console.log('✅ ✅ DIMENSION CORRECTE: 768 (text-embedding-004)');
        return true;
      } else {
        console.log('❌ ⚠️  Dimension incorrecte! Attendu 768, got', dims);
        return false;
      }
    } else {
      console.log('❌ Status:', response.status);
      const text = await response.text();
      console.log('❌ Erreur:', text.substring(0, 200));
      return false;
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
    return false;
  }
}

async function test3_SemanticSearch() {
  console.log('\n3️⃣  TEST: /api/search/semantic');
  console.log('━'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'robe rouge fluide',
        threshold: 0.5,
        limit: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status:', response.status);
      console.log('✅ Produits trouvés:', data.products?.length || 0);
      if (data.products?.length > 0) {
        console.log('✅ Premier produit:', data.products[0].name);
      } else {
        console.log('⚠️  Aucun produit trouvé (normal si DB vide)');
      }
      return true;
    } else {
      console.log('❌ Status:', response.status);
      const text = await response.text();
      console.log('❌ Erreur:', text.substring(0, 200));
      return false;
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 TESTS DES APIS VESTYLE');
  console.log('═'.repeat(60));
  console.log('Base URL:', BASE_URL);
  console.log('Attente de 2s avant de commencer...\n');

  await delay(2000);

  const results = [];
  results.push(await test1_ChatAPI());
  await delay(1000);
  
  results.push(await test2_GenerateEmbeddings());
  await delay(1000);
  
  results.push(await test3_SemanticSearch());

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(60));
  console.log('Chat API:', results[0] ? '✅ PASS' : '❌ FAIL');
  console.log('Generate Embeddings:', results[1] ? '✅ PASS (768 dim)' : '❌ FAIL');
  console.log('Semantic Search:', results[2] ? '✅ PASS' : '⚠️  FAIL/PARTIAL');
  console.log('═'.repeat(60));

  const totalPass = results.filter(r => r).length;
  console.log(`\n✅ ${totalPass}/${results.length} tests réussis\n`);

  if (totalPass === results.length) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
  }

  process.exit(totalPass === results.length ? 0 : 1);
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
