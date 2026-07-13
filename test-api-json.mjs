#!/usr/bin/env node
/**
 * Test d'ajout de produit — Reproduction de l'erreur JSON
 */

async function testAddProduct() {
  const API_URL = 'http://localhost:3001/api/products/generate-embeddings';
  
  const testPayload = {
    imageUrl: 'https://images.unsplash.com/photo-1553926069-e91a4cb6b371?w=400&h=400&fit=crop',
    name: 'Test Produit',
    description: 'Un produit de test'
  };

  console.log('🧪 Test API generate-embeddings');
  console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));
  console.log('');

  try {
    console.log(`📡 POST ${API_URL}`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    console.log(`📋 Content-Type: ${contentType}`);
    
    const text = await response.text();
    console.log(`📝 Raw response (${text.length} chars):`);
    console.log(text.slice(0, 500));
    console.log('');

    if (contentType?.includes('application/json')) {
      try {
        const json = JSON.parse(text);
        console.log('✅ JSON valide');
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.error('❌ JSON invalide:', e.message);
        console.error('Position:', e.message.match(/position (\d+)/)?.[1]);
      }
    }
  } catch (err) {
    console.error('💥 Erreur réseau:', err.message);
  }
}

testAddProduct();
