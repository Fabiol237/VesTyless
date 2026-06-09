import { Client } from 'pg';

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000,
});

const vec = '[' + Array.from({ length: 1024 }).map((_, i) => (i + 1) / 1024).join(',') + ']';

try {
  await client.connect();
  console.log('Connected');
  const res = await client.query('SELECT $1::vector AS v', [vec]);
  console.log('Result length:', res.rows[0].v.length);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.end();
}
