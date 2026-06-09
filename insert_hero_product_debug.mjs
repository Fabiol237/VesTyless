import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const db = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000,
});

db.on('error', (err) => {
  console.error('DB error event:', err.message);
});

db.on('end', () => {
  console.log('DB connection ended');
});

db.on('notice', (notice) => {
  console.log('DB notice:', notice.message);
});

const IMAGE_URL = 'http://127.0.0.1:3000/hero-bg.png';
const PRODUCT_NAME = 'Chemise Fashion Bleue - Test Recherche';
const PRODUCT_DESCRIPTION = 'Chemise bleue test pour recherche visuelle vectorielle';
const GLOBAL_CATEGORY_ID = 'c1000000-0000-0000-0000-000000000001';

async function run() {
  try {
    await db.connect();
    console.log('Connected to Supabase DB');

    const storeRes = await db.query('SELECT id FROM stores LIMIT 1');
    if (storeRes.rows.length === 0) {
      throw new Error('Aucun store trouvé dans la base.');
    }
    const storeId = storeRes.rows[0].id;
    console.log('Store ID:', storeId);

    const existingRes = await db.query('SELECT id FROM products WHERE name = $1 AND store_id = $2 LIMIT 1', [PRODUCT_NAME, storeId]);
    if (existingRes.rows.length > 0) {
      console.log('Produit déjà présent, id=', existingRes.rows[0].id);
      return;
    }

    console.log('Calling embedding API...');
    const response = await fetch('http://127.0.0.1:3000/api/products/generate-embeddings-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: IMAGE_URL,
        categoryId: 1,
        name: PRODUCT_NAME,
        description: PRODUCT_DESCRIPTION,
      }),
    });
    console.log('API response status:', response.status);
    const bodyText = await response.text();
    console.log('API body length:', bodyText.length);
    const embedData = JSON.parse(bodyText);
    console.log('Parsed embed response success:', embedData.success);
    if (!embedData.success) {
      throw new Error('Embedding API error: ' + (embedData.error || JSON.stringify(embedData)));
    }
    if (!Array.isArray(embedData.embedding) || embedData.embedding.length !== 1024) {
      throw new Error('Invalid embedding length: ' + (embedData.embedding?.length));
    }
    console.log('Embedding OK');

    const vectorText = '[' + embedData.embedding.join(',') + ']';
    console.log('Preparing insert...');
    const insertQuery = `INSERT INTO products (store_id, global_category_id, name, description, price, stock_quantity, image_url, images, image_embedding_1024, text_embedding_1024, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::vector,$10::vector,$11) RETURNING id`;
    const values = [storeId, GLOBAL_CATEGORY_ID, PRODUCT_NAME, embedData.visionAnalysis || PRODUCT_DESCRIPTION, 25000, 5, IMAGE_URL, [IMAGE_URL], vectorText, vectorText, true];
    console.log('Executing insert...');
    const insertRes = await db.query(insertQuery, values);
    console.log('Insert success:', insertRes.rows[0]);
  } catch (err) {
    console.error('RUN ERROR:', err.message || err);
  } finally {
    console.log('Closing DB');
    await db.end();
  }
}

run();
