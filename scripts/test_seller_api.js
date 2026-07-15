require('dotenv').config({ path: '.env.local' });
const fetch = globalThis.fetch || require('node-fetch');

const storeId = process.argv[2] || '';
if (!storeId) {
  console.error('Usage: node scripts/test_seller_api.js <storeId>');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/ai/seller-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, action: 'suggest_reply', messages: [{ role: 'user', content: 'Bonjour, quel est le prix de la veste?' }] }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text.slice(0, 2000));
  } catch (e) {
    console.error('Request failed:', e.message || e);
  }
})();
