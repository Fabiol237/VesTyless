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
  const res = await client.query(`
    SELECT id, name, global_category_id, image_url, is_active
    FROM products
    WHERE name ILIKE '%chemise fashion bleue%'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.end();
}
