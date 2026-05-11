const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function applyFix() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Applying delivery permissions fix...');
    const sql = fs.readFileSync(path.join(__dirname, 'fix-delivery-perms.sql'), 'utf8');
    await client.query(sql);
    console.log('SUCCESS: Permissions applied.');
  } catch (err) {
    console.error('Error applying fix:', err.message);
  } finally {
    await client.end();
  }
}

applyFix();
