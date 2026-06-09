import { Client } from 'pg';
import crypto from 'crypto';

const db = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000,
});

const CATEGORY_UPDATES = [
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Alimentation & Supermarché', slug: 'alimentation', icon: 'ShoppingCart' },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Divers', slug: 'divers', icon: 'Package' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Électronique & High-Tech', slug: 'electronique', icon: 'Smartphone' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Maison & Électroménager', slug: 'maison', icon: 'Home' },
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Mode & Beauté', slug: 'mode-beaute', icon: 'Shirt' },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Santé & Bien-être', slug: 'sante', icon: 'Heart' },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'Services & Loisirs', slug: 'services-loisirs', icon: 'Star' },
];

async function run() {
  try {
    await db.connect();
    console.log('Connected to Supabase DB');

    console.log('Updating global_categories to match home page categories...');
    for (const cat of CATEGORY_UPDATES) {
      const { id, name, slug, icon } = cat;
      await db.query(
        `UPDATE global_categories SET name = $1, slug = $2, icon = $3 WHERE id = $4`,
        [name, slug, icon, id]
      );
    }
    console.log('Category update complete.');

    const { rows: catRows } = await db.query('SELECT id, name, slug, icon FROM global_categories ORDER BY id;');
    console.log('Current categories:', JSON.stringify(catRows, null, 2));

    console.log('\nEnsuring there is at least one store...');
    const { rows: storeRows } = await db.query('SELECT id FROM stores LIMIT 1;');
    let storeId;
    if (storeRows.length > 0) {
      storeId = storeRows[0].id;
      console.log('Found existing store:', storeId);
    } else {
      const slug = `test-store-${Date.now()}`;
      const ownerId = crypto.randomUUID();
      const insertStore = await db.query(
        `INSERT INTO stores (owner_id, name, slug, description, city) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [ownerId, 'VesTyle Test Shop', slug, 'Store de test pour recherche visuelle', 'Yaoundé']
      );
      storeId = insertStore.rows[0].id;
      console.log('Created test store:', storeId);
    }

    const productName = 'Chemise Fashion Bleue - Test Recherche';
    const description = 'Chemise bleue test pour recherche visuelle';
    const imageUrl = 'http://localhost:3000/hero-bg.png';
    const embedRes = await fetch('http://127.0.0.1:3000/api/products/generate-embeddings-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl,
        categoryId: 1,
        name: productName,
        description,
      }),
    });

    if (!embedRes.ok) {
      const text = await embedRes.text();
      throw new Error(`Embedding API failed ${embedRes.status}: ${text}`);
    }

    const embedData = await embedRes.json();
    if (!embedData.success || !Array.isArray(embedData.embedding) || embedData.embedding.length !== 1024) {
      throw new Error(`Invalid embedding response: ${JSON.stringify(embedData)}`);
    }

    console.log('Embedding generated successfully.');

    const { rows: productsExisting } = await db.query(
      'SELECT id FROM products WHERE name = $1 AND store_id = $2 LIMIT 1',
      [productName, storeId]
    );
    if (productsExisting.length > 0) {
      console.log('Product already exists in DB:', productsExisting[0].id);
    } else {
      const globalCategoryId = 'c1000000-0000-0000-0000-000000000001';
      const insertProductQuery = `
        INSERT INTO products (
          store_id, global_category_id, name, description, price, stock_quantity,
          image_url, images, image_embedding_1024, text_embedding_1024, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;
      const values = [
        storeId,
        globalCategoryId,
        productName,
        embedData.visionAnalysis || description,
        25000,
        5,
        imageUrl,
        [imageUrl],
        embedData.embedding,
        embedData.embedding,
        true,
      ];
      const insertResult = await db.query(insertProductQuery, values);
      console.log('Inserted product ID:', insertResult.rows[0].id);
    }

    console.log('\nDone. The database categories are aligned and the product has been added.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

run();
