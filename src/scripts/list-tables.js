const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function list() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Public Tables:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

list();
