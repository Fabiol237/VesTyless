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
  console.log('Connected');
  const vec = '[1,2,3]';
  const res = await client.query('SELECT $1::vector AS v', [vec]);
  console.log('Result', res.rows);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.end();
}
