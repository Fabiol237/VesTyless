import { Client } from 'pg';

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();
  const storeRes = await client.query('SELECT id FROM stores LIMIT 1');
  const storeId = storeRes.rows[0]?.id;
  const vec = '[' + Array.from({ length: 1024 }).fill(0.001).join(',') + ']';
  const sql = `INSERT INTO products (store_id, global_category_id, name, price, image_url, images, image_embedding_1024, text_embedding_1024, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7::vector,$8::vector,$9) RETURNING id`;
  const res = await client.query(sql, [storeId, 'c1000000-0000-0000-0000-000000000001', 'TEST FULL VECTOR INSERT', 9999, 'http://localhost:3000/hero-bg.png', ['http://localhost:3000/hero-bg.png'], vec, vec, true]);
  console.log('Inserted', res.rows[0]);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.end();
}
