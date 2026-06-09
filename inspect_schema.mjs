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
  const tables = ['global_categories', 'stores', 'products'];
  for (const table of tables) {
    console.log(`=== ${table} ===`);
    const res = await client.query(`select column_name, data_type, is_nullable, column_default from information_schema.columns where table_name = $1 order by ordinal_position`, [table]);
    console.log(JSON.stringify(res.rows, null, 2));
  }
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.end();
}
