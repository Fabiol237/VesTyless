const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function check() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'livreurs'");
    console.log('Livreurs Columns:', res.rows);
    
    const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'delivery_tracking'");
    console.log('Tracking Columns:', res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
