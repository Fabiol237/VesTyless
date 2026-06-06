#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3002';

async function testAPIs() {
  console.log('🧪 TESTS DES ENDPOINTS\n');

  // Test 1: Visual Search API
  console.log('1️⃣ Test /api/search/visual');
  console.log('━'.repeat(50));
  try {
    // Créer une image de test (PNG transparente 1x1)
    const transparentPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    const blob = new Blob([transparentPng], { type: 'image/png' });
    formData.append('image', blob, 'test.png');

    const response = await fetch(`${BASE_URL}/api/search/visual`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Visual Search OK');
      console.log('   Status:', response.status);
      console.log('   Products trouvés:', data.products?.length || 0);
      console.log('   Description IA:', data.description?.substring(0, 50) + '...');
    } else {
      console.log('❌ Erreur Visual Search:', response.status);
      const text = await response.text();
      console.log('   Réponse:', text.substring(0, 100));
    }
  } catch (e) {
    console.log('❌ Erreur:', e.message);
  }

  console.log('\n2️⃣ Test /api/search/semantic');
  console.log('━'.repeat(50));
  try {
    const response = await fetch(`${BASE_URL}/api/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'robe rouge fluide' })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Semantic Search OK');
      console.log('   Status:', response.status);
      console.log('   Products trouvés:', data.products?.length || 0);
    } else {
      console.log('❌ Erreur Semantic:', response.status);
      const text = await response.text();
      console.log('   Réponse:', text.substring(0, 100));
    }
  } catch (e) {
    console.log('❌ Erreur:', e.message);
  }

  console.log('\n3️⃣ Test /api/chat');
  console.log('━'.repeat(50));
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Bonjour, quels sont vos produits les plus vendus?' }
        ],
        tts: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat API OK');
      console.log('   Status:', response.status);
      console.log('   Réponse:', data.content?.substring(0, 80) + '...');
    } else {
      console.log('❌ Erreur Chat:', response.status);
      const text = await response.text();
      console.log('   Réponse:', text.substring(0, 100));
    }
  } catch (e) {
    console.log('❌ Erreur:', e.message);
  }

  console.log('\n4️⃣ Test /api/products/generate-embeddings');
  console.log('━'.repeat(50));
  try {
    const response = await fetch(`${BASE_URL}/api/products/generate-embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Robe fleurie',
        description: 'Robe longue avec motifs floraux'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Generate Embeddings OK');
      console.log('   Status:', response.status);
      console.log('   Embedding dimensions:', data.embedding?.length || 0);
      if (data.embedding?.length === 768) {
        console.log('   ✅ Dimension correcte: 768');
      } else {
        console.log('   ⚠️ Dimension incorrecte:', data.embedding?.length);
      }
    } else {
      console.log('❌ Erreur Embeddings:', response.status);
      const text = await response.text();
      console.log('   Réponse:', text.substring(0, 100));
    }
  } catch (e) {
    console.log('❌ Erreur:', e.message);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ TESTS TERMINÉS');
  process.exit(0);
}

// Attendre 3s pour que le serveur soit prêt
setTimeout(testAPIs, 3000);
